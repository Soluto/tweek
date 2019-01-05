package main

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"

	"github.com/Soluto/tweek/services/gateway/appConfig"
	"github.com/Soluto/tweek/services/gateway/audit"
	"github.com/Soluto/tweek/services/gateway/corsSupport"
	"github.com/Soluto/tweek/services/gateway/externalApps"
	"github.com/Soluto/tweek/services/gateway/handlers"
	"github.com/Soluto/tweek/services/gateway/metrics"
	"github.com/Soluto/tweek/services/gateway/proxy"

	"github.com/Soluto/tweek/services/gateway/passThrough"

	"github.com/Soluto/tweek/services/gateway/security"
	"github.com/Soluto/tweek/services/gateway/transformation"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/urfave/negroni"
)

func main() {
	configuration := appConfig.InitConfig()
	externalApps.Init(&configuration.Security.PolicyStorage)

	app := newApp(configuration)

	if len(configuration.Server.Ports) > 1 {
		for _, port := range configuration.Server.Ports[1:] {
			go runServer(port, app)
		}
	}

	port := configuration.Server.Ports[0]
	runServer(port, app)
}

func runServer(port int, handler http.Handler) {
	server := &http.Server{
		Addr:    fmt.Sprintf(":%v", port),
		Handler: handler,
	}

	log.Printf("Gateway is listening on port %v", port)
	log.Fatalf("Server on port %v failed unexpectedly: %v", port, server.ListenAndServe())
}

func newApp(config *appConfig.Configuration) http.Handler {
	token := security.InitJWT(&config.Security.TweekSecretKey)

	authorizer, err := withRetry(3, time.Second*5, initAuthorizer, &config.Security)

	auditor, err := audit.New(os.Stdout)
	if err != nil {
		panic("Unable to create security auditing log")
	}

	userInfoExtractor, err := setupSubjectExtractorWithRefresh(config.Security)
	if err != nil {
		log.Panicln("Unable to setup user info extractor", err)
	}

	authenticationMiddleware := security.AuthenticationMiddleware(&config.Security, userInfoExtractor, auditor)
	authorizationMiddleware := security.AuthorizationMiddleware(authorizer, auditor)

	recovery := negroni.NewRecovery()
	recovery.PrintStack = false
	middleware := negroni.New(recovery)
	middleware.Use(authenticationMiddleware)
	middleware.Use(authorizationMiddleware)

	router := NewRouter(config)

	transformation.Mount(&config.Upstreams, config.V2Routes, token, middleware, router.V2Router())

	metricsVar := metrics.NewMetricsVar("passthrough")
	noAuthMiddleware := negroni.New(recovery)

	passThrough.MountWithHosts(config.Upstreams.API, config.V1Hosts.API, "api", noAuthMiddleware, metricsVar, router.MainRouter())
	passThrough.MountWithHosts(config.Upstreams.Authoring, config.V1Hosts.Authoring, "authoring", noAuthMiddleware, metricsVar, router.MainRouter())

	passThrough.MountWithoutHost(config.Upstreams.API, "api", noAuthMiddleware, metricsVar, router.V1Router())
	passThrough.MountWithoutHost(config.Upstreams.API, "api", noAuthMiddleware, metricsVar, router.MainRouter().PathPrefix("/configurations/").Subrouter())
	passThrough.MountWithoutHost(config.Upstreams.Authoring, "authoring", noAuthMiddleware, metricsVar, router.LegacyNonV1Router())

	security.MountAuth(&config.Security.Auth, &config.Security.TweekSecretKey, noAuthMiddleware, router.AuthRouter())

	router.MainRouter().PathPrefix("/version").HandlerFunc(handlers.NewVersionHandler(&config.Upstreams, Version))
	router.MainRouter().PathPrefix("/health").HandlerFunc(handlers.NewHealthHandler())
	router.MainRouter().PathPrefix("/status").HandlerFunc(handlers.NewStatusHandler(&config.Upstreams))

	handlers.SetupRevisionUpdater(config.Security.PolicyStorage.NatsEndpoint)

	router.MainRouter().PathPrefix("/metrics").Handler(prometheus.Handler())

	router.V2Router().PathPrefix("/current-user").HandlerFunc(security.NewUserInfoHandler(&config.Security, userInfoExtractor))

	router.MainRouter().PathPrefix("/swagger.yml").HandlerFunc(swaggerHandler())

	app := negroni.New(recovery)

	corsSupportMiddleware := corsSupport.New(&config.Security.Cors)
	if corsSupportMiddleware != nil {
		app.Use(corsSupportMiddleware)
	}

	if &config.Upstreams.Editor != nil {
		editorURL, _ := url.Parse(config.Upstreams.Editor)
		editorForwarder := proxy.New(editorURL, nil)
		router.MainRouter().Methods("GET").PathPrefix("/").Handler(negroni.New(editorForwarder))
	}

	app.UseHandler(router)

	return app
}

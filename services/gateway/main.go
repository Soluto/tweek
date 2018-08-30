package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Soluto/tweek/services/gateway/appConfig"
	"github.com/Soluto/tweek/services/gateway/audit"
	"github.com/Soluto/tweek/services/gateway/corsSupport"
	"github.com/Soluto/tweek/services/gateway/externalApps"
	"github.com/Soluto/tweek/services/gateway/handlers"
	"github.com/Soluto/tweek/services/gateway/metrics"

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

	logger := negroni.NewLogger()

	middleware := negroni.New(recovery, logger)
	middleware.Use(authenticationMiddleware)
	middleware.Use(authorizationMiddleware)

	router := NewRouter(config)
	transformation.Mount(&config.Upstreams, config.V2Routes, token, middleware, router.V2Router())

	metricsVar := metrics.NewMetricsVar("passthrough")
	noAuthMiddleware := negroni.New(recovery)
	passThrough.Mount(&config.Upstreams, &config.V1Hosts, noAuthMiddleware, metricsVar, router.V1Router())
	passThrough.Mount(&config.Upstreams, &config.V1Hosts, noAuthMiddleware, metricsVar, router.LegacyNonV1Router())

	security.MountAuth(&config.Security.Auth, &config.Security.TweekSecretKey, noAuthMiddleware, router.AuthRouter())

	router.MainRouter().PathPrefix("/version").HandlerFunc(handlers.NewVersionHandler(&config.Upstreams, config.Version))
	router.MainRouter().PathPrefix("/health").HandlerFunc(handlers.NewHealthHandler())
	router.MainRouter().PathPrefix("/status").HandlerFunc(handlers.NewStatusHandler(&config.Upstreams))

	router.MainRouter().PathPrefix("/metrics").Handler(prometheus.Handler())

	app := negroni.New(negroni.NewRecovery())

	corsSupportMiddleware := corsSupport.New(&config.Security.Cors)
	if corsSupportMiddleware != nil {
		app.Use(corsSupportMiddleware)
	}
	app.UseHandler(router)

	return app
}

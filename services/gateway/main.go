package main

import (
	"fmt"
	"net/http"
	"net/url"
	"os"
	"time"

	"tweek-gateway/appConfig"
	"tweek-gateway/audit"
	"tweek-gateway/corsSupport"
	"tweek-gateway/externalApps"
	"tweek-gateway/handlers"
	"tweek-gateway/metrics"
	"tweek-gateway/proxy"

	"tweek-gateway/passThrough"

	"tweek-gateway/security"
	"tweek-gateway/transformation"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/urfave/negroni"

	joonix "github.com/joonix/log"
	"github.com/sirupsen/logrus"
)

func main() {
	logrus.SetFormatter(&joonix.FluentdFormatter{})
	configuration := appConfig.InitConfig()

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

	logrus.WithField("port", port).Info("Gateway is listening")
	err := server.ListenAndServe()
	logrus.WithError(err).WithField("port", port).Fatal("Server failed unexpectedly")
}

func newApp(config *appConfig.Configuration) http.Handler {
	token := security.InitJWT(&config.Security.TweekSecretKey)

	authorizer, err := withRetry(3, time.Second*5, initAuthorizer, &config.Security)
	if err != nil {
		panic("Unable to create Authorizer")
	}

	externalApps.Init(&config.Security.PolicyStorage)

	auditor, err := audit.New(os.Stdout)
	if err != nil {
		panic("Unable to create security auditing log")
	}

	userInfoExtractor, err := setupSubjectExtractorWithRefresh(config.Security)
	if err != nil {
		logrus.WithError(err).Panic("Unable to setup user info extractor")
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

	router.MainRouter().PathPrefix("/metrics").Handler(promhttp.Handler())

	router.V2Router().PathPrefix("/current-user").HandlerFunc(security.NewUserInfoHandler(&config.Security, userInfoExtractor))

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

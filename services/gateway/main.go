package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"runtime"
	"time"

	"github.com/minio/minio-go"
	nats "github.com/nats-io/go-nats"

	"github.com/Soluto/casbin-minio-adapter"

	"github.com/Soluto/casbin-nats-watcher"

	"github.com/Soluto/tweek/services/gateway/appConfig"
	"github.com/Soluto/tweek/services/gateway/audit"
	"github.com/Soluto/tweek/services/gateway/corsSupport"
	"github.com/Soluto/tweek/services/gateway/externalApps"
	"github.com/Soluto/tweek/services/gateway/handlers"
	"github.com/Soluto/tweek/services/gateway/metrics"

	"github.com/Soluto/tweek/services/gateway/passThrough"

	"github.com/Soluto/tweek/services/gateway/security"
	"github.com/Soluto/tweek/services/gateway/transformation"

	"github.com/casbin/casbin"
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

	enforcer, err := withRetry(3, time.Second*5, initEnforcer, &config.Security)

	auditor, err := audit.New(os.Stdout)
	if err != nil {
		panic("Unable to create security auditing log")
	}
	if config.Security.Enforce {
		auditor.EnforcerEnabled()
	} else {
		auditor.EnforcerDisabled()
	}

	userInfoExtractor, err := setupUserInfoExtractorWithRefresh(config.Security)
	if err != nil {
		log.Panicln("Unable to setup user info extractor", err)
	}

	authenticationMiddleware := security.AuthenticationMiddleware(&config.Security, userInfoExtractor, auditor)
	authorizationMiddleware := security.AuthorizationMiddleware(enforcer, auditor)

	recovery := negroni.NewRecovery()
	recovery.PrintStack = false
	middleware := negroni.New(recovery)
	middleware.Use(authenticationMiddleware)
	middleware.Use(authorizationMiddleware)

	router := NewRouter(config)
	transformation.Mount(&config.Upstreams, config.V2Routes, token, middleware, router.V2Router())

	metricsVar := metrics.NewMetricsVar("passthrough")
	noAuthMiddleware := negroni.New(negroni.NewRecovery())
	passThrough.Mount(&config.Upstreams, &config.V1Hosts, noAuthMiddleware, metricsVar, router.V1Router())
	passThrough.Mount(&config.Upstreams, &config.V1Hosts, noAuthMiddleware, metricsVar, router.LegacyNonV1Router())

	security.MountAuth(config.Security.Auth.Providers, &config.Security.TweekSecretKey, noAuthMiddleware, router.AuthRouter())

	router.MainRouter().PathPrefix("/version").HandlerFunc(handlers.NewVersionHandler(&config.Upstreams, config.Version))
	router.MainRouter().PathPrefix("/health").HandlerFunc(handlers.NewHealthHandler())

	router.MainRouter().PathPrefix("/metrics").Handler(prometheus.Handler())

	app := negroni.New(negroni.NewRecovery())

	corsSupportMiddleware := corsSupport.New(&config.Security.Cors)
	if corsSupportMiddleware != nil {
		app.Use(corsSupportMiddleware)
	}
	app.UseHandler(router)

	return app
}

func initEnforcer(config *appConfig.Security) (*casbin.SyncedEnforcer, error) {
	policyStorage := &config.PolicyStorage
	modelPath := policyStorage.CasbinModel

	watcher, err := natswatcher.NewWatcher(policyStorage.NatsEndpoint, "version")
	if err != nil {
		return nil, fmt.Errorf("Error while creating Nats watcher %v", err)
	}

	adapter, err := minioadapter.NewAdapter(policyStorage.MinioEndpoint,
		policyStorage.MinioAccessKey,
		policyStorage.MinioSecretKey,
		policyStorage.MinioUseSSL,
		policyStorage.MinioBucketName,
		"security/policy.csv")
	if err != nil {
		return nil, fmt.Errorf("Error while creating Minio adapter:\n %v", err)
	}

	enforcer := casbin.NewSyncedEnforcer(modelPath, adapter)
	enforcer.EnableLog(true)
	enforcer.EnableEnforce(config.Enforce)
	enforcer.SetWatcher(watcher)

	return enforcer, nil
}

type enforcerFactory func(*appConfig.Security) (*casbin.SyncedEnforcer, error)

func withRetry(times int, sleepDuration time.Duration, todo enforcerFactory, arg *appConfig.Security) (*casbin.SyncedEnforcer, error) {
	var res *casbin.SyncedEnforcer
	var err error
	for i := 0; i < times; i++ {
		res, err = todo(arg)
		if err == nil {
			return res, nil
		}
		log.Printf("Error creating enforcer, retrying...\n %v", err)
		time.Sleep(sleepDuration)
	}
	return nil, err
}

func setupUserInfoExtractorWithRefresh(config appConfig.Security) (security.UserAndGroupExtractor, error) {
	initial, err := setupUserInfoExtractor(config)
	if err != nil {
		return nil, err
	}

	synchronized := security.NewSynchronizedUserAndGroupExtractor(initial)

	nc, err := nats.Connect(config.PolicyStorage.NatsEndpoint)
	if err != nil {
		return nil, err
	}
	subscription, err := nc.Subscribe("version", refreshExtractor(config, synchronized))
	if err != nil {
		return nil, err
	}
	runtime.SetFinalizer(synchronized, func(s interface{}) {
		if subscription != nil && subscription.IsValid() {
			subscription.Unsubscribe()
		}
	})

	return synchronized, nil
}

func refreshExtractor(cfg appConfig.Security, extractor *security.SynchronizedUserAndGroupExtractor) nats.MsgHandler {
	return nats.MsgHandler(func(msg *nats.Msg) {
		defer func() {
			if r := recover(); r != nil {
				log.Println("Failed to refresh user info extractor", r)
			}
		}()

		newExtractor, err := setupUserInfoExtractor(cfg)
		if err == nil {
			extractor.UpdateExtractor(newExtractor)
		} else {
			log.Println("Error updating user info extractor", err)
		}
	})
}

func setupUserInfoExtractor(cfg appConfig.Security) (security.UserAndGroupExtractor, error) {
	policyStorage := cfg.PolicyStorage
	client, err := minio.New(policyStorage.MinioEndpoint, policyStorage.MinioAccessKey, policyStorage.MinioSecretKey, policyStorage.MinioUseSSL)
	if err != nil {
		return nil, err
	}

	obj, err := client.GetObject(policyStorage.MinioBucketName, "security/rules.rego", minio.GetObjectOptions{})
	if err != nil {
		return nil, err
	}

	data, err := ioutil.ReadAll(obj)
	if err != nil {
		return nil, err
	}
	return security.NewDefaultUserAndGroupExtractor(string(data), "rules", "subject"), nil
}

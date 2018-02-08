package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/Soluto/casbin-minio-adapter"

	"github.com/Soluto/casbin-nats-watcher"

	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
	"github.com/Soluto/tweek/services/secure-gateway/audit"

	"github.com/Soluto/tweek/services/secure-gateway/passThrough"

	"github.com/Soluto/tweek/services/secure-gateway/modelManagement"
	"github.com/Soluto/tweek/services/secure-gateway/monitoring"
	"github.com/Soluto/tweek/services/secure-gateway/security"
	"github.com/Soluto/tweek/services/secure-gateway/transformation"
	"github.com/casbin/casbin"

	"github.com/urfave/negroni"
)

func main() {
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

	log.Printf("Secure Gateway is listening on port %v", port)
	log.Fatalf("Server on port %v failed unexpectedly: %v", port, server.ListenAndServe())
}

func newApp(config *appConfig.Configuration) http.Handler {
	token := security.InitJWT(config.Security.TweekSecretKeyPath)

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
	authenticationMiddleware := security.AuthenticationMiddleware(&config.Security, auditor)
	authorizationMiddleware := security.AuthorizationMiddleware(enforcer, auditor)
	middleware := negroni.New(negroni.NewRecovery(), authenticationMiddleware, authorizationMiddleware)

	router := NewRouter(config)
	router.MonitoringRouter().HandleFunc("isAlive", monitoring.IsAlive)

	modelManagement.Mount(enforcer, middleware, router.ModelManagementRouter())

	transformation.Mount(&config.Upstreams, token, middleware, router.V2Router())

	passThrough.Mount(&config.Upstreams, &config.V1Hosts, negroni.New(negroni.NewRecovery()), router.V1Router())
	passThrough.Mount(&config.Upstreams, &config.V1Hosts, negroni.New(negroni.NewRecovery()), router.LegacyNonV1Router())

	app := negroni.New(negroni.NewRecovery())
	app.UseHandler(router)

	return app
}

func initEnforcer(config *appConfig.Security) (*casbin.SyncedEnforcer, error) {
	policyStorage := &config.PolicyStorage
	modelPath := policyStorage.CasbinModel

	watcher, err := natswatcher.NewWatcher(policyStorage.NatsEndpoint, policyStorage.NatsSubject)
	if err != nil {
		return nil, fmt.Errorf("Error while creating Nats watcher %v", err)
	}

	adapter, err := minioadapter.NewAdapter(policyStorage.MinioEndpoint,
		policyStorage.MinioAccessKey,
		policyStorage.MinioSecretKey,
		policyStorage.MinioUseSSL,
		policyStorage.MinioBucketName,
		policyStorage.MinioPolicyObjectName)
	if err != nil {
		return nil, fmt.Errorf("Error while creating Minio adapter %v", err)
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
		log.Println("Error creating enforcer, retrying", err)
		time.Sleep(sleepDuration)
	}
	return nil, err
}

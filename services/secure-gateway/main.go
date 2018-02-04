package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
	"github.com/Soluto/tweek/services/secure-gateway/audit"
	"github.com/Soluto/tweek/services/secure-gateway/natsClient"

	"github.com/Soluto/tweek/services/secure-gateway/passThrough"
	"github.com/Soluto/tweek/services/secure-gateway/policyStorage"

	"github.com/Soluto/tweek/services/secure-gateway/modelManagement"
	"github.com/Soluto/tweek/services/secure-gateway/monitoring"
	"github.com/Soluto/tweek/services/secure-gateway/security"
	"github.com/Soluto/tweek/services/secure-gateway/transformation"
	"github.com/casbin/casbin"

	"github.com/urfave/negroni"
)

func main() {
	configuration := appConfig.InitConfig()
	app := natsClient.New(&configuration.Security.PolicyStorage, newApp(configuration), func() {}).(http.Handler)

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

func newApp(config *appConfig.Configuration) func() interface{} {
	return func() interface{} {
		token := security.InitJWT(config.Security.TweekSecretKeyPath)

		workDir, err := ioutil.TempDir("/tmp", "policyStorage")
		if err != nil {
			log.Panicln("Error loading policies (prepare to create):", err)
		}

		storage, err := policyStorage.New(workDir, &config.Security.PolicyStorage)
		if err != nil {
			log.Panicln("Error loading policies from minio:", err)
		}

		model := config.Security.PolicyStorage.CasbinModel
		enforcer := casbin.NewSyncedEnforcer(model, storage)
		enforcer.EnableLog(false)
		enforcer.EnableEnforce(config.Security.Enforce)

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
}

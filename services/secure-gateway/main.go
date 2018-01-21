package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/Soluto/tweek/services/secure-gateway/audit"

	"github.com/Soluto/tweek/services/secure-gateway/passThrough"
	"github.com/Soluto/tweek/services/secure-gateway/policyRepository"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	"github.com/Soluto/tweek/services/secure-gateway/modelManagement"
	"github.com/Soluto/tweek/services/secure-gateway/monitoring"
	"github.com/Soluto/tweek/services/secure-gateway/security"
	"github.com/Soluto/tweek/services/secure-gateway/transformation"
	"github.com/casbin/casbin"

	"github.com/urfave/negroni"
)

func main() {
	configuration := config.LoadFromFile("gateway.json")

	token := security.InitJWT()
	app := NewApp(configuration, token)

	if len(configuration.Server.Ports) > 1 {
		for _, port := range configuration.Server.Ports[1:] {
			go runServer(port, app)
		}
	}

	port := configuration.Server.Ports[0]
	runServer(port, app)
}

// NewApp creates a new app
func NewApp(configuration *config.Configuration, token security.JWTToken) http.Handler {
	workDir, err := ioutil.TempDir("/tmp", "repo")
	if err != nil {
		log.Panicln("Error loading policies (prepare to create):", err)
	}

	repo, err := policyRepository.New(workDir, &configuration.Security.PolicyRepository)
	if err != nil {
		log.Panicln("Error loading policies (creating repository):", err)
	}

	model := configuration.Security.PolicyRepository.CasbinModel
	enforcer := casbin.NewSyncedEnforcer(model, repo)
	enforcer.EnableLog(false)
	enforcer.EnableEnforce(configuration.Security.Enforce)

	auditor, err := audit.New(os.Stdout)
	if err != nil {
		panic("Unable to create security auditing log")
	}
	if configuration.Security.Enforce {
		auditor.EnforcerEnabled()
	} else {
		auditor.EnforcerDisabled()
	}

	authenticationMiddleware := security.AuthenticationMiddleware(configuration.Security, auditor)
	authorizationMiddleware := security.AuthorizationMiddleware(enforcer, auditor)
	middleware := negroni.New(negroni.NewRecovery(), authenticationMiddleware, authorizationMiddleware)

	router := NewRouter(configuration)
	router.MonitoringRouter().HandleFunc("isAlive", monitoring.IsAlive)

	modelManagement.Mount(enforcer, middleware, router.ModelManagementRouter())

	transformation.Mount(configuration.Upstreams, token, middleware, router.V2Router())

	passThrough.Mount(configuration.Upstreams, configuration.V1Hosts, token, negroni.New(negroni.NewRecovery()), router.V1Router())
	passThrough.Mount(configuration.Upstreams, configuration.V1Hosts, token, negroni.New(negroni.NewRecovery()), router.LegacyNonV1Router())

	app := negroni.New(negroni.NewRecovery())
	app.UseHandler(router)

	return app
}

func runServer(port int, handler http.Handler) {
	server := &http.Server{
		Addr:    fmt.Sprintf(":%v", port),
		Handler: handler,
	}

	log.Printf("Secure Gateway is listening on port %v", port)
	log.Fatalf("Server on port %v failed unexpectedly: %v", port, server.ListenAndServe())
}

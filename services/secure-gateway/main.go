package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Soluto/tweek/services/secure-gateway/jwtCreator"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	"github.com/Soluto/tweek/services/secure-gateway/goThrough"
	"github.com/Soluto/tweek/services/secure-gateway/modelManagement"
	"github.com/Soluto/tweek/services/secure-gateway/monitoring"
	"github.com/Soluto/tweek/services/secure-gateway/security"
	"github.com/Soluto/tweek/services/secure-gateway/transformation"
	"github.com/casbin/casbin"

	"github.com/urfave/negroni"
)

func main() {
	configuration := config.LoadFromFile("gateway.json")

	token := jwtCreator.InitJWT()
	app := NewApp(configuration, token)

	if len(configuration.Server.Ports) > 1 {
		for _, port := range configuration.Server.Ports[1:] {
			p := port
			s := &http.Server{
				Addr:    fmt.Sprintf(":%v", p),
				Handler: app,
			}

			log.Printf("Secure Gateway is listening on port %v", p)
			go func() {
				log.Fatalf("Server on port %v failed unexpectedly: %v", p, s.ListenAndServe())
			}()
		}
	}

	p := configuration.Server.Ports[0]
	s := &http.Server{
		Addr:    fmt.Sprintf(":%v", p),
		Handler: app,
	}

	log.Printf("Secure Gateway is listening on port %v", p)
	log.Fatalf("Server on port %v failed unexpectedly: %v", p, s.ListenAndServe())
}

// NewApp creates a new app
func NewApp(config *config.Configuration, token *jwtCreator.JWTToken) http.Handler {
	enforcer := casbin.NewSyncedEnforcer(config.Security.CasbinPolicy, config.Security.CasbinModel)
	enforcer.EnableEnforce(config.Security.Enforce)

	router := NewRouter(config)
	authenticationMiddleware := security.AuthenticationMiddleware(config.Security)
	authorizationMiddleware := security.AuthorizationMiddleware(enforcer)

	middleware := negroni.New(negroni.NewRecovery(), authorizationMiddleware)

	router.MonitoringRouter().HandleFunc("/isAlive", monitoring.IsAlive)
	modelManagement.Mount(enforcer, middleware, router.ModelManagementRouter())
	goThrough.Mount(config.Upstreams, config.V1Hosts, token, middleware, router.V1Router())
	transformation.Mount(config.Upstreams, token, middleware, router.V2Router())

	goThrough.Mount(config.Upstreams, config.V1Hosts, token, negroni.New(negroni.NewRecovery()), router.LegacyNonV1Router())

	app := negroni.New(negroni.NewRecovery(), authenticationMiddleware)
	app.UseHandler(router)

	return app
}

package main

import (
	"fmt"
	"log"
	"net/http"

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

	app := NewApp(configuration)

	s := &http.Server{
		Addr:    fmt.Sprintf(":%v", configuration.Server.Port),
		Handler: app,
	}

	log.Printf("Secure Gateway is listening on port %v", configuration.Server.Port)
	err := s.ListenAndServe()
	if err != nil {
		panic(err)
	}
}

// NewApp creates a new app
func NewApp(config *config.Configuration) http.Handler {
	enforcer := casbin.NewSyncedEnforcer(config.Security.CasbinPolicy, config.Security.CasbinModel)
	router := NewRouter(config.Upstreams)

	router.MonitoringRouter().HandleFunc("/isAlive", monitoring.IsAlive)
	modelManagement.Mount(enforcer, negroni.New(negroni.NewRecovery(), security.AuthorizationMiddleware(enforcer)), router.ModelManagementRouter())
	goThrough.Mount(config.Upstreams, config.V1Hosts, negroni.New(negroni.NewRecovery(), security.AuthorizationMiddleware(enforcer)), router.V1Router())
	transformation.Mount(config.Upstreams, negroni.New(negroni.NewRecovery(), security.AuthorizationMiddleware(enforcer)), router.V2Router())

	app := negroni.New(negroni.NewRecovery(), security.UserInfoMiddleware(config.Security))
	app.UseHandler(router)

	return app
}

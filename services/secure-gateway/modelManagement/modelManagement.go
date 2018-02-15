package modelManagement

import (
	"github.com/Soluto/tweek/services/secure-gateway/handlers"
	"github.com/casbin/casbin"
	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
)

// Mount this function mounts model authoring api
func Mount(enforcer *casbin.SyncedEnforcer, middleware *negroni.Negroni, router *mux.Router) {
	router.Methods("GET").PathPrefix("/models").Handler(middleware.With(handlers.NewModelsRead(enforcer)))
	router.Methods("POST").PathPrefix("/models").Handler(middleware.With(handlers.NewModelsWrite(enforcer)))
}

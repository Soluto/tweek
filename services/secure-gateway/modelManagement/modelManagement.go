package modelManagement

import (
	"github.com/Soluto/tweek/services/secure-gateway/handlers"
	"github.com/casbin/casbin"
	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
)

// Mount this function mounts model management api
func Mount(router *mux.Router, enforcer *casbin.SyncedEnforcer) {
	router.Methods("GET").PathPrefix("/models").Handler(negroni.New(handlers.NewModelsRead(enforcer)))
	router.Methods("POST").PathPrefix("/models").Handler(negroni.New(handlers.NewModelsWrite(enforcer)))
}

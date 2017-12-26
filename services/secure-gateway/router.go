package main

import (
	"log"
	"net/http"
	"net/url"

	"github.com/casbin/casbin"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	"github.com/Soluto/tweek/services/secure-gateway/handlers"
	"github.com/Soluto/tweek/services/secure-gateway/proxy"
	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
)

type Router interface {
	http.Handler
	V2Router() *mux.Router
}

type router struct {
	router         *mux.Router
	basePathRouter *mux.Router
}

// NewRouter creates a new transformation middleware
func NewRouter(upstreams *config.Upstreams, enforcer *casbin.SyncedEnforcer) Router {
	mainRouter := mux.NewRouter()
	basePathRouter := mainRouter.PathPrefix("/api/v2/").Subrouter()
	apiURL, err := url.Parse(upstreams.API)
	if err != nil {
		log.Panicln("Invalid upstream", upstreams.API)
	}
	apiForwarder := proxy.New(apiURL)
	basePathRouter.Methods("GET").PathPrefix("/models").Handler(negroni.New(handlers.NewModelsRead(enforcer), apiForwarder))
	basePathRouter.Methods("POST").PathPrefix("/models").Handler(negroni.New(handlers.NewModelsWrite(enforcer), apiForwarder))

	return &router{
		router:         mainRouter,
		basePathRouter: basePathRouter,
	}
}

// V2Router - returns the mux router for the base path (`/api/v2/`)
func (t *router) V2Router() *mux.Router { return t.basePathRouter }

func (t *router) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	t.router.ServeHTTP(rw, r)
}

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
	V1Router() *mux.Router
	V2Router() *mux.Router
}

type router struct {
	router   *mux.Router
	v1Router *mux.Router
	v2Router *mux.Router
}

// NewRouter creates a new transformation middleware
func NewRouter(upstreams *config.Upstreams, enforcer *casbin.SyncedEnforcer) Router {
	mainRouter := mux.NewRouter()

	apiURL, err := url.Parse(upstreams.API)
	if err != nil {
		log.Panicln("Invalid upstream", upstreams.API)
	}
	apiForwarder := proxy.New(apiURL)

	v1Router := mainRouter.PathPrefix("/api/v1/").Subrouter()
	v1Router.Methods("GET").Handler(negroni.New(apiForwarder))

	v2Router := mainRouter.PathPrefix("/api/v2/").Subrouter()

	v2Router.Methods("GET").PathPrefix("/models").Handler(negroni.New(handlers.NewModelsRead(enforcer), apiForwarder))
	v2Router.Methods("POST").PathPrefix("/models").Handler(negroni.New(handlers.NewModelsWrite(enforcer), apiForwarder))

	return &router{
		router:   mainRouter,
		v1Router: v1Router,
		v2Router: v2Router,
	}
}

func (t *router) V1Router() *mux.Router { return t.v1Router }

// V2Router - returns the mux router for the base path (`/api/v2/`)
func (t *router) V2Router() *mux.Router { return t.v2Router }

func (t *router) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	t.router.ServeHTTP(rw, r)
}

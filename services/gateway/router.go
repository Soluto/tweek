package main

import (
	"net/http"
	"strings"

	"tweek-gateway/appConfig"
	"github.com/gorilla/mux"
)

// Router struct contains all subrouters
type Router interface {
	http.Handler
	V1Router() *mux.Router
	V2Router() *mux.Router
	LegacyNonV1Router() *mux.Router
	MainRouter() *mux.Router
	AuthRouter() *mux.Router
}

type router struct {
	router            *mux.Router
	v1Router          *mux.Router
	v2Router          *mux.Router
	legacyNonV1Router *mux.Router
	authRouter        *mux.Router
}

// NewRouter creates a new transformation middleware
func NewRouter(configuration *appConfig.Configuration) Router {
	mainRouter := mux.NewRouter()

	legacyNonV1Router := mainRouter.MatcherFunc(func(r *http.Request, m *mux.RouteMatch) bool {
		path := r.URL.EscapedPath()
		host := strings.Split(r.Host, ":")[0]
		result := strings.HasPrefix(path, "/api/swagger.json") || anyString(host, configuration.V1Hosts.Authoring)

		return result
	}).Subrouter()

	v1Router := mainRouter.PathPrefix("/api/v1/").Subrouter()

	v2Router := mainRouter.PathPrefix("/api/v2/").Subrouter()

	authRouter := mainRouter.PathPrefix("/auth").Subrouter()

	return &router{
		router:            mainRouter,
		v1Router:          v1Router,
		v2Router:          v2Router,
		legacyNonV1Router: legacyNonV1Router,
		authRouter:        authRouter,
	}
}

func (t *router) MainRouter() *mux.Router { return t.router }

func (t *router) V1Router() *mux.Router { return t.v1Router }

// V2Router - returns the mux router for the base path (`/api/v2/`)
func (t *router) V2Router() *mux.Router { return t.v2Router }

func (t *router) LegacyNonV1Router() *mux.Router { return t.legacyNonV1Router }

func (t *router) AuthRouter() *mux.Router { return t.authRouter }

func (t *router) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	t.router.ServeHTTP(rw, r)
}

func anyString(given string, candidates []string) bool {
	for _, candidate := range candidates {
		if candidate == given {
			return true
		}
	}

	return false
}

package main

import (
	"net/http"
	"strings"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	"github.com/gorilla/mux"
)

// Router struct contains all subrouters
type Router interface {
	http.Handler
	MonitoringRouter() *mux.Router
	ModelManagementRouter() *mux.Router
	V1Router() *mux.Router
	V2Router() *mux.Router
	LegacyNonV1Router() *mux.Router
	MainRouter() *mux.Router
}

type router struct {
	router                *mux.Router
	monitoringRouter      *mux.Router
	modelManagementRouter *mux.Router
	v1Router              *mux.Router
	v2Router              *mux.Router
	legacyNonV1Router     *mux.Router
}

// NewRouter creates a new transformation middleware
func NewRouter(configuration *config.Configuration) Router {
	mainRouter := mux.NewRouter()

	monitoringRouter := mainRouter.PathPrefix("/api/monitoring/").Subrouter()
	modelManagementRouter := mainRouter.PathPrefix("/api/modelManagement/").Subrouter()

	legacyNonV1Router := mainRouter.MatcherFunc(func(r *http.Request, m *mux.RouteMatch) bool {
		path := r.URL.EscapedPath()
		host := strings.Split(r.Host, ":")[0]
		result := strings.HasPrefix(path, "/health") || strings.HasPrefix(path, "/api/swagger.json") || anyString(host, configuration.V1Hosts.Authoring)

		return result
	}).Subrouter()

	v1Router := mainRouter.PathPrefix("/api/v1/").Subrouter()

	v2Router := mainRouter.PathPrefix("/api/v2/").Subrouter()

	return &router{
		router:                mainRouter,
		monitoringRouter:      monitoringRouter,
		modelManagementRouter: modelManagementRouter,
		v1Router:              v1Router,
		v2Router:              v2Router,
		legacyNonV1Router:     legacyNonV1Router,
	}
}

func (t *router) MainRouter() *mux.Router { return t.router }

func (t *router) MonitoringRouter() *mux.Router { return t.monitoringRouter }

func (t *router) ModelManagementRouter() *mux.Router { return t.modelManagementRouter }

func (t *router) V1Router() *mux.Router { return t.v1Router }

// V2Router - returns the mux router for the base path (`/api/v2/`)
func (t *router) V2Router() *mux.Router { return t.v2Router }

func (t *router) LegacyNonV1Router() *mux.Router { return t.legacyNonV1Router }

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

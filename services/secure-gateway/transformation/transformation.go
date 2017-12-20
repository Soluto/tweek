package transformation

import (
	"log"
	"net/http"
	"net/url"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	"github.com/Soluto/tweek/services/secure-gateway/proxy"
	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
)

// Transformation holds the transformation configuration
type Transformation struct {
	router         *mux.Router
	basePathRouter *mux.Router
}

// New creates a new transformation middleware
func New(upstreams *config.Upstreams) *Transformation {
	router := mux.NewRouter()
	basePathRouter := router.PathPrefix("/api/v2/").Subrouter()
	apiURL, err := url.Parse(upstreams.API)
	if err != nil {
		log.Panicln("Invalid upstream", upstreams.API)
	}

	apiForwarder := proxy.New(apiURL)
	basePathRouter.Methods("GET").PathPrefix("/values").Handler(negroni.New(NewValuesGet(apiURL), apiForwarder))

	return &Transformation{
		router: router,
	}
}

// BasePathRouter - returns the mux router for the base path (`/api/v2/`)
func (t *Transformation) BasePathRouter() *mux.Router { return t.basePathRouter }

func (t *Transformation) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	t.router.ServeHTTP(rw, r)
}

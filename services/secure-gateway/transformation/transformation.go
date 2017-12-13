package transformation

import (
	"log"
	"net/http"
	"net/url"
	"regexp"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	"github.com/Soluto/tweek/services/secure-gateway/proxy"
	"github.com/gorilla/mux"
)

// Transformation holds the transformation configuration
type Transformation struct {
	router *mux.Router
}

// New creates a new transformation middleware
func New(upstreams *config.Upstreams) *Transformation {
	router := mux.NewRouter()
	basePathRouter := router.PathPrefix("/api/v2/").Subrouter()
	apiURL, err := url.Parse(upstreams.API)
	if err != nil {
		panic("Invalid upstream " + upstreams.API)
	}

	apiForwarder := proxy.New(apiURL)
	route := basePathRouter.Methods("GET").PathPrefix("/values")
	route.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
		newURL := getValuesURLByRequest(apiURL, r)
		r.URL = newURL
		apiForwarder.ServeHTTP(rw, r, nil)
	})

	return &Transformation{
		router: router,
	}
}

func (t *Transformation) ServeHTTP(rw http.ResponseWriter, r *http.Request) {
	t.router.ServeHTTP(rw, r)
}

func getValuesURLByRequest(upstream *url.URL, req *http.Request) *url.URL {
	original := req.URL.String()
	newURL := valuesURLRegexp.ReplaceAllString(original, upstream.String()+`/api/v1/keys/$1$2`)

	result, err := url.Parse(newURL)
	if err != nil {
		log.Panicln("Failed converting values URL", err)
	}

	return result
}

var valuesURLRegexp *regexp.Regexp

func init() {
	valuesURLRegexp = regexp.MustCompile(`^https?://[\w\d\.][\w\d\.-]*/api/v2/values/([^\?]+)(.*)$`)
}

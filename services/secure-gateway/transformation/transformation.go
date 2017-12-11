package transformation

import (
	"net/http"
	"net/url"
	"path"
	"strings"

	"github.com/Soluto/tweek/services/secure-gateway/proxy"
	"github.com/gorilla/mux"
)

// Transformation holds the transformation configuration
type Transformation struct {
	router *mux.Router
}

// UpstreamsConfig is the list of upstrem URLs.
type UpstreamsConfig struct {
	APIUpstream          string
	AuthoringUpstream    string
	ManagementUpstream   string
	EditorServerUpstream string
}

// New creates a new transformation middleware
func New(upstreams *UpstreamsConfig) *Transformation {
	router := mux.NewRouter()
	basePathRouter := router.PathPrefix("/api/v2/").Subrouter()
	apiURL, err := url.Parse(upstreams.APIUpstream)
	if err != nil {
		panic("Invalid upstream " + upstreams.APIUpstream)
	}

	apiForwarder := proxy.New(apiURL)
	route := basePathRouter.Methods("GET").Path("/configuration")
	route.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
		newURL := getConfigurationURLByRequest(apiURL, r)
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

func getConfigurationURLByRequest(upstream *url.URL, req *http.Request) *url.URL {
	newURL := *upstream
	newURL.Path = path.Join("/api/v1/keys/", req.URL.Query().Get("key"))
	includes := req.URL.Query()["$include"]
	flatten := strings.ToLower(req.URL.Query().Get("$flatten"))
	newQuery := &url.Values{
		"$include": includes,
	}

	if flatten == "true" {
		(*newQuery)["$flatten"] = []string{"true"}
	}

	newURL.RawQuery = newQuery.Encode()
	return &newURL
}

package transformation

import (
	"fmt"
	"net/http"
	"net/url"
	"path"
	"strings"

	"github.com/gorilla/mux"
	"github.com/vulcand/oxy/forward"
)

func init() {
}

// NewRouter Returns router, which transforms v2 requests into v1
func NewRouter() *mux.Router {
	// Forwards incoming requests to whatever location URL points to, adds proper forwarding headers

	fwd, _ := forward.New()

	url, _ := url.Parse("http://localhost:8090/")

	r := mux.NewRouter()
	baseRouter := r.PathPrefix("/api/v2/").Subrouter()

	baseRouter.Methods("GET").Subrouter().HandleFunc("/configuration", func(res http.ResponseWriter, req *http.Request) {
		newURL := getConfigurationURLByRequest(url, req)
		// transformedRequest, err := http.NewRequest("GET", newURL.String(), req.Body)
		transformedRequest := *req
		// if err != nil {
		// 	panic("Failed to create a new request")
		// }

		transformedRequest.URL = newURL
		transformedRequest.RequestURI = newURL.String()

		fmt.Printf("new url: %s\n", newURL.String())
		fmt.Printf("original request: %v\n", req)
		fmt.Printf("transformed request: %v\n", transformedRequest)

		fwd.ServeHTTP(res, &transformedRequest)
		// fwd.ServeHTTP(res, req)
	})

	return r
}

func getConfigurationURLByRequest(upstream *url.URL, req *http.Request) *url.URL {
	newURL := *upstream
	newURL.Path = path.Join("/api/v1/keys/", req.URL.Query().Get("key"))
	includes := req.URL.Query()["$include"]
	flatten := strings.ToLower(req.URL.Query().Get("$flatten"))
	// newQuery["$include"] = includes
	newQuery := &url.Values{
		"$include": includes,
	}

	if flatten == "true" {
		(*newQuery)["$flatten"] = []string{"true"}
	}

	newURL.RawQuery = newQuery.Encode()
	// fmt.Printf("RAW QUERY: %v\nINCLUDES: %v\nFLATTEN: %v\nORIGINAL QUERY: %v\n", newURL.RawQuery, includes, flatten, req.URL.Query())
	fmt.Printf("MODIFIED URL: %v\nAS STRING: %v\n", newURL, newURL.String())
	return &newURL
}

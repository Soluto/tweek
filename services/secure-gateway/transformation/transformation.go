package transformation

import (
	"log"
	"net/url"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	"github.com/Soluto/tweek/services/secure-gateway/proxy"
	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
)

// // Transformation holds the transformation configuration
// type Transformation interface {
// 	// SetupRoutes sets up the router to catch v2 requests and transform them into v1
// 	SetupRoutes(base *mux.Router)
// }

// type transformation struct {
// 	api        *url.URL
// 	authoring  *url.URL
// 	management *url.URL
// 	middleware *negroni.Negroni
// }

// Mount - mounts the request transformation handlers and middleware
func Mount(upstreams *config.Upstreams, middleware *negroni.Negroni, router *mux.Router) {
	// URLs
	api := parseUpstreamOrPanic(upstreams.API)
	authoring := parseUpstreamOrPanic(upstreams.Authoring)
	// management := parseUpstreamOrPanic(upstreams.Management)

	// Proxy forwarders
	apiForwarder := proxy.New(api)
	authoringForwarder := proxy.New(authoring)
	// managementForwarder := proxy.New(t.management)

	// Mounting handlers
	router.Methods("GET").PathPrefix("/values").Handler(middleware.With(NewValuesGet(api), apiForwarder))

	router.Methods("GET").PathPrefix("/tags").Handler(middleware.With(NewTagsGet(authoring), authoringForwarder))
	router.Methods("PUT").PathPrefix("/tags").Handler(middleware.With(NewTagsSave(authoring), authoringForwarder))

	router.Methods("GET", "POST", "DELETE").PathPrefix("/context").Handler(middleware.With(TransformContextRequest(api), apiForwarder))

	router.Methods("GET", "POST", "DELETE", "PATCH").PathPrefix("/schemas").Handler(middleware.With(TransformSchemasRequest(authoring), authoringForwarder))
}

func parseUpstreamOrPanic(u string) *url.URL {
	result, err := url.Parse(u)
	if err != nil {
		log.Panicln("Invalid upstream", u)
	}
	return result
}

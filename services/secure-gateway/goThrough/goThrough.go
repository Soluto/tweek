package goThrough

import (
	"log"
	"net/url"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	"github.com/Soluto/tweek/services/secure-gateway/proxy"
	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
)

// Mount - mounts the request goThrough handlers and middleware
func Mount(upstreams *config.Upstreams, middleware *negroni.Negroni, router *mux.Router) {
	// URLs
	api := parseUpstreamOrPanic(upstreams.API)
	authoring := parseUpstreamOrPanic(upstreams.Authoring)
	management := parseUpstreamOrPanic(upstreams.Management)

	// Proxy forwarders
	apiForwarder := proxy.New(api)
	authoringForwarder := proxy.New(authoring)
	managementForwarder := proxy.New(management)

	// Mounting handlers
	router.Host("tweek-api.mysoluto.com").Handler(middleware.With(apiForwarder))
	router.Host("tweek-authoring.mysoluto.com").Handler(middleware.With(authoringForwarder))
	router.Host("tweek-management.mysoluto.com").Handler(middleware.With(managementForwarder))
}

func parseUpstreamOrPanic(u string) *url.URL {
	result, err := url.Parse(u)
	if err != nil {
		log.Panicln("Invalid upstream", u)
	}
	return result
}

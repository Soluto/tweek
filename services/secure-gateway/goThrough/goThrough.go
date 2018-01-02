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
func Mount(upstreams *config.Upstreams, v1Hosts *config.V1Hosts, middleware *negroni.Negroni, router *mux.Router) {
	// URLs
	api := parseUpstreamOrPanic(upstreams.API)
	authoring := parseUpstreamOrPanic(upstreams.Authoring)
	management := parseUpstreamOrPanic(upstreams.Management)

	// Proxy forwarders
	apiForwarder := proxy.New(api)
	authoringForwarder := proxy.New(authoring)
	managementForwarder := proxy.New(management)

	// Mounting handlers
	for _, host := range v1Hosts.API {
		router.Host(host).Handler(middleware.With(apiForwarder))
	}
	for _, host := range v1Hosts.Authoring {
		router.Host(host).Handler(middleware.With(authoringForwarder))
	}
	for _, host := range v1Hosts.Management {
		router.Host(host).Handler(middleware.With(managementForwarder))
	}
}

func parseUpstreamOrPanic(u string) *url.URL {
	result, err := url.Parse(u)
	if err != nil {
		log.Panicln("Invalid upstream", u)
	}
	return result
}

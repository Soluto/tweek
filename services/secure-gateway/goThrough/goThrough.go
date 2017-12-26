package goThrough

import (
	"log"
	"net/url"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	"github.com/Soluto/tweek/services/secure-gateway/proxy"
	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
)

func Mount(upstreams *config.Upstreams, middleware *negroni.Negroni, router *mux.Router) {
	// URLs
	api := parseUpstreamOrPanic(upstreams.API)
	// authoring := parseUpstreamOrPanic(upstreams.Authoring)
	// management := parseUpstreamOrPanic(upstreams.Management)

	// Proxy forwarders
	apiForwarder := proxy.New(api)
	// authoringForwarder := proxy.New(authoring)
	// managementForwarder := proxy.New(t.management)

	// Mounting handlers
	router.Methods("GET").PathPrefix("/keys").Handler(middleware.With(apiForwarder))

	// router.Methods("GET").PathPrefix("/tags").Handler(middleware.With(NewTagsGet(authoring), authoringForwarder))
	// router.Methods("PUT").PathPrefix("/tags").Handler(middleware.With(NewTagsSave(authoring), authoringForwarder))
}

func parseUpstreamOrPanic(u string) *url.URL {
	result, err := url.Parse(u)
	if err != nil {
		log.Panicln("Invalid upstream", u)
	}
	return result
}

package passThrough

import (
	"log"
	"net/url"

	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
	"github.com/Soluto/tweek/services/secure-gateway/proxy"
	"github.com/Soluto/tweek/services/secure-gateway/security"
	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
)

// Mount - mounts the request passThrough handlers and middleware
func Mount(upstreams *appConfig.Upstreams, v1Hosts *appConfig.V1Hosts, token security.JWTToken, middleware *negroni.Negroni, router *mux.Router) {
	// URLs
	api := parseUpstreamOrPanic(upstreams.API)
	authoring := parseUpstreamOrPanic(upstreams.Authoring)
	management := parseUpstreamOrPanic(upstreams.Management)

	// Proxy forwarders
	apiForwarder := proxy.New(api, token)
	authoringForwarder := proxy.New(authoring, token)
	managementForwarder := proxy.New(management, token)

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

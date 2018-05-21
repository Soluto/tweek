package transformation

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"regexp"

	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
	"github.com/Soluto/tweek/services/secure-gateway/proxy"
	"github.com/Soluto/tweek/services/secure-gateway/security"
	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
)

// Mount - mounts the request transformation handlers and middleware
func Mount(upstreamConfig *appConfig.Upstreams, routesConfig []appConfig.V2Route, token security.JWTToken, middleware *negroni.Negroni, router *mux.Router) {
	// URLs
	upstreams := map[string]*url.URL{
		"api":       parseUpstreamOrPanic(upstreamConfig.API),
		"authoring": parseUpstreamOrPanic(upstreamConfig.Authoring),
	}

	// Proxy forwarders
	forwarders := map[string]negroni.HandlerFunc{
		"api":       proxy.New(upstreams["api"], token),
		"authoring": proxy.New(upstreams["authoring"], token),
	}

	// Mounting handlers
	router.Methods("OPTIONS").Handler(middleware)
	for _, routeConfig := range routesConfig {
		mountRouteTransform(router, middleware, routeConfig, upstreams, forwarders)
	}
}

func mountRouteTransform(router *mux.Router, middleware *negroni.Negroni, routeConfig appConfig.V2Route, upstreams map[string]*url.URL, forwarders map[string]negroni.HandlerFunc) {
	handlerFunc := middleware.With(createTransformMiddleware(routeConfig, upstreams), forwarders[routeConfig.Service])
	router.Methods(routeConfig.Methods...).PathPrefix(routeConfig.RoutePathPrefix).Handler(handlerFunc)

}

func createTransformMiddleware(routeConfig appConfig.V2Route, upstreams map[string]*url.URL) negroni.HandlerFunc {
	re := regexp.MustCompile(routeConfig.RouteRegexp)
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		newURL := getURLForUpstream(upstreams[routeConfig.Service], r, re, routeConfig.UpstreamPath)
		if routeConfig.UserInfo {
			setQueryParams(r.Context(), newURL, security.UserInfoKey)
		}

		r.URL = newURL
		next(rw, r)
	}
}

func parseUpstreamOrPanic(u string) *url.URL {
	result, err := url.Parse(u)
	if err != nil {
		log.Panicln("Invalid upstream", u)
	}
	return result
}

func getURLForUpstream(upstream *url.URL, req *http.Request, urlRegexp *regexp.Regexp, upstreamRoute string) *url.URL {
	original := req.URL.String()
	newURL := urlRegexp.ReplaceAllString(original, fmt.Sprintf("%v%v", upstream.String(), upstreamRoute))
	result, err := url.Parse(newURL)
	if err != nil {
		log.Panicln("Failed converting context URL", err)
	}
	return result
}

func setQueryParams(ctx context.Context, url *url.URL, key interface{}) {
	userInfo, ok := ctx.Value(key).(security.UserInfo)
	if !ok {
		panic("User info missing")
	}

	q := url.Query()
	q.Set("author.name", userInfo.Name())
	q.Set("author.email", userInfo.Email())
	url.RawQuery = q.Encode()
}

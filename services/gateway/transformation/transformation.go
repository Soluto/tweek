package transformation

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"path"
	"regexp"

	"github.com/sirupsen/logrus"

	"github.com/Soluto/tweek/services/gateway/appConfig"
	"github.com/Soluto/tweek/services/gateway/proxy"
	"github.com/Soluto/tweek/services/gateway/security"
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
		newURL := getURLForUpstream(upstreams[routeConfig.Service], r, re, routeConfig.UpstreamPath, routeConfig.RewriteKeyPath)
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
		logrus.WithError(err).WithField("upstream", u).Panic("Invalid upstream")
	}
	return result
}

func getURLForUpstream(upstream *url.URL, req *http.Request, urlRegexp *regexp.Regexp, upstreamRoute string, keyPath bool) *url.URL {
	var original string
	u := req.URL
	if keyPath && u.Query().Get("keyPath") != "" {
		original = replaceKeyPath(u)
	} else {
		original = u.String()
	}
	newURL := urlRegexp.ReplaceAllString(original, fmt.Sprintf("%v%v", upstream.String(), upstreamRoute))
	result, err := url.Parse(newURL)
	if err != nil {
		logrus.WithError(err).Panic("Failed converting context URL")
	}
	return result
}

func replaceKeyPath(u *url.URL) string {
	path := path.Join(u.Path, u.Query().Get("keyPath"))
	newQuery := u.Query()

	newQuery.Del("keyPath")

	return fmt.Sprintf("%s?%s", path, newQuery.Encode())
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

package transformation

import (
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
func Mount(upstreams *appConfig.Upstreams, token security.JWTToken, middleware *negroni.Negroni, router *mux.Router) {
	// URLs
	api := parseUpstreamOrPanic(upstreams.API)
	authoring := parseUpstreamOrPanic(upstreams.Authoring)
	// management := parseUpstreamOrPanic(upstreams.Management)

	// Proxy forwarders
	apiForwarder := proxy.New(api, token)
	authoringForwarder := proxy.New(authoring, token)

	// Mounting handlers
	router.Methods("OPTIONS").Handler(middleware)

	router.Methods("GET").PathPrefix("/values").Handler(middleware.With(transformValuesGetRequest(api), apiForwarder))

	router.Methods("GET").PathPrefix("/tags").Handler(middleware.With(transformTagsGetRequest(authoring), authoringForwarder))
	router.Methods("PUT").PathPrefix("/tags").Handler(middleware.With(transformTagsSaveRequest(authoring), authoringForwarder))

	router.Methods("GET", "POST", "DELETE").PathPrefix("/context").Handler(middleware.With(transformContextRequest(api), apiForwarder))

	router.Methods("GET", "POST", "DELETE", "PATCH").PathPrefix("/schemas").Handler(middleware.With(transformSchemasRequest(authoring), authoringForwarder))
}

func parseUpstreamOrPanic(u string) *url.URL {
	result, err := url.Parse(u)
	if err != nil {
		log.Panicln("Invalid upstream", u)
	}
	return result
}

// TransformContextRequest this function makes call to api service
func transformContextRequest(upstream *url.URL) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		newURL := getURLForUpstream(upstream, r, contextURLRegexp, contextUpstreamRoute)
		r.URL = newURL
		next(rw, r)
	}
}

// TransformSchemasRequest this function makes call to api service
func transformSchemasRequest(upstream *url.URL) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		newURL := getURLForUpstream(upstream, r, schemasURLRegexp, schemasUpstreamRoute)
		r.URL = newURL
		next(rw, r)
	}
}

// TransformTagsGetRequest creates tags transformation middleware to get all the tags
// upstream is the upstream URL, where the request should be redirected
func transformTagsGetRequest(upstream *url.URL) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		newURL := getURLForUpstream(upstream, r, tagsURLRegexp, tagsUpstreamRoute)
		r.URL = newURL
		next(rw, r)
	}
}

// TransformTagsSaveRequest creates tags transformation middleware to save the tags in tweek
// upstream is the upstream URL, where the request should be redirected
func transformTagsSaveRequest(upstream *url.URL) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		newURL := getURLForUpstream(upstream, r, tagsURLRegexp, tagsUpstreamRoute)
		userInfo, ok := r.Context().Value(security.UserInfoKey).(security.UserInfo)
		if !ok {
			panic("User info missing")
		}

		newURL.Query().Set("author.name", userInfo.Name())
		newURL.Query().Set("author.email", userInfo.Email())
		r.URL = newURL

		next(rw, r)
	}
}

// TransformValuesGetRequest creates values transformation middleware
// upstream is the upstream URL, where the request should be redirected
func transformValuesGetRequest(upstream *url.URL) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		newURL := getURLForUpstream(upstream, r, valuesURLRegexp, valuesUpstreamRoute)
		r.URL = newURL
		next(rw, r)
	}
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

var contextURLRegexp, schemasURLRegexp, valuesURLRegexp, tagsURLRegexp *regexp.Regexp
var contextUpstreamRoute, schemasUpstreamRoute, valuesUpstreamRoute, tagsUpstreamRoute string

func init() {
	contextURLRegexp = regexp.MustCompile(`^/api/v2/context/([^\?]+)(.*)$`)
	schemasURLRegexp = regexp.MustCompile(`^/api/v2/schemas(.*)$`)
	valuesURLRegexp = regexp.MustCompile(`^/api/v2/values/([^\?]+)(.*)$`)
	tagsURLRegexp = regexp.MustCompile(`^/api/v2/tags`)

	contextUpstreamRoute = `/api/v1/context/$1$2`
	schemasUpstreamRoute = `/api/v1/schemas$1`
	valuesUpstreamRoute = `/api/v1/keys/$1$2`
	tagsUpstreamRoute = `/api/v1/tags`

}

package transformation

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
	"regexp"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	"github.com/Soluto/tweek/services/secure-gateway/proxy"
	"github.com/Soluto/tweek/services/secure-gateway/security"
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
func Mount(upstreams *config.Upstreams, token *security.JWTToken, middleware *negroni.Negroni, router *mux.Router) {
	// URLs
	api := parseUpstreamOrPanic(upstreams.API)
	authoring := parseUpstreamOrPanic(upstreams.Authoring)
	// management := parseUpstreamOrPanic(upstreams.Management)

	// Proxy forwarders
	apiForwarder := proxy.New(api, token)
	authoringForwarder := proxy.New(authoring, token)
	// managementForwarder := proxy.New(t.management)

	// Mounting handlers
	router.Methods("GET").PathPrefix("/values").Handler(middleware.With(TransformValuesGetRequest(api), apiForwarder))

	router.Methods("GET").PathPrefix("/tags").Handler(middleware.With(TransformTagsGetRequest(authoring), authoringForwarder))
	router.Methods("PUT").PathPrefix("/tags").Handler(middleware.With(TransformTagsSaveRequest(authoring), authoringForwarder))

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

// TransformContextRequest this function makes call to api service
func TransformContextRequest(upstream *url.URL) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		newURL := getURLForUpstream(upstream, r, contextURLRegexp, contextUpstreamRoute)
		r.URL = newURL
		next(rw, r)
	}
}

// TransformSchemasRequest this function makes call to api service
func TransformSchemasRequest(upstream *url.URL) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		newURL := getURLForUpstream(upstream, r, schemasURLRegexp, schemasUpstreamRoute)
		r.URL = newURL
		next(rw, r)
	}
}

// TransformTagsGetRequest creates tags transformation middleware to get all the tags
// upstream is the upstream URL, where the request should be redirected
func TransformTagsGetRequest(upstream *url.URL) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		newURL := getURLForUpstream(upstream, r, tagsURLRegexp, tagsUpstreamRoute)
		r.URL = newURL
		next(rw, r)
	}
}

// TransformTagsSaveRequest creates tags transformation middleware to save the tags in tweek
// upstream is the upstream URL, where the request should be redirected
func TransformTagsSaveRequest(upstream *url.URL) negroni.HandlerFunc {
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
func TransformValuesGetRequest(upstream *url.URL) negroni.HandlerFunc {
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
	contextURLRegexp = regexp.MustCompile(`^https?://[\w\d\.][\w\d\.-]*/api/v2/context/([^\?]+)(.*)$`)
	schemasURLRegexp = regexp.MustCompile(`^https?://[\w\d\.][\w\d\.-]*/api/v2/schemas(.*)$`)
	valuesURLRegexp = regexp.MustCompile(`^https?://[\w\d\.][\w\d\.-]*/api/v2/values/([^\?]+)(.*)$`)
	tagsURLRegexp = regexp.MustCompile(`^https?://[\w\d\.][\w\d\.-]*/api/v2/tags`)

	contextUpstreamRoute = `/api/v1/context/$1$2`
	schemasUpstreamRoute = `/api/v1/schemas$1`
	valuesUpstreamRoute = `/api/v1/keys/$1$2`
	tagsUpstreamRoute = `/api/v1/tags`

}

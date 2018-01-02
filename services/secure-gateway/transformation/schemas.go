package transformation

import (
	"log"
	"net/http"
	"net/url"
	"regexp"

	"github.com/urfave/negroni"
)

// TransformSchemasRequest this function makes call to api service
func TransformSchemasRequest(upstream *url.URL) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		newURL := getSchemasURLForUpstream(upstream, r)
		r.URL = newURL
		next(rw, r)
	}
}

func getSchemasURLForUpstream(upstream *url.URL, req *http.Request) *url.URL {
	original := req.URL.String()
	newURL := schemasURLRegexp.ReplaceAllString(original, upstream.String()+`/api/v1/schemas$1`)
	result, err := url.Parse(newURL)
	if err != nil {
		log.Panicln("Failed converting schemas URL", err)
	}

	return result
}

var schemasURLRegexp *regexp.Regexp

func init() {
	schemasURLRegexp = regexp.MustCompile(`^https?://[\w\d\.][\w\d\.-]*/api/v2/schemas(.*)$`)
}

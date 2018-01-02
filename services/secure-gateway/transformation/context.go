package transformation

import (
	"log"
	"net/http"
	"net/url"
	"regexp"

	"github.com/urfave/negroni"
)

// TransformContextRequest this function makes call to api service
func TransformContextRequest(upstream *url.URL) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		newURL := getContextURLForUpstream(upstream, r)
		r.URL = newURL
		next(rw, r)
	}
}

func getContextURLForUpstream(upstream *url.URL, req *http.Request) *url.URL {
	original := req.URL.String()
	newURL := contextURLRegexp.ReplaceAllString(original, upstream.String()+`/api/v1/context/$1$2`)

	result, err := url.Parse(newURL)
	if err != nil {
		log.Panicln("Failed converting context URL", err)
	}

	return result
}

var contextURLRegexp *regexp.Regexp

func init() {
	contextURLRegexp = regexp.MustCompile(`^https?://[\w\d\.][\w\d\.-]*/api/v2/context/([^\?]+)(.*)$`)
}

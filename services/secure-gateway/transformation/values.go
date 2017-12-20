package transformation

import (
	"log"
	"net/http"
	"net/url"
	"regexp"

	"github.com/urfave/negroni"
)

// NewValuesGet creates values transformation middleware
// upstream is the upstream URL, where the request should be redirected
func NewValuesGet(upstream *url.URL) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		newURL := getValuesURLByRequest(upstream, r)
		r.URL = newURL
		next(rw, r)
	}
}

func getValuesURLByRequest(upstream *url.URL, req *http.Request) *url.URL {
	original := req.URL.String()
	newURL := valuesURLRegexp.ReplaceAllString(original, upstream.String()+`/api/v1/keys/$1$2`)

	result, err := url.Parse(newURL)
	if err != nil {
		log.Panicln("Failed converting values URL", err)
	}

	return result
}

var valuesURLRegexp *regexp.Regexp

func init() {
	valuesURLRegexp = regexp.MustCompile(`^https?://[\w\d\.][\w\d\.-]*/api/v2/values/([^\?]+)(.*)$`)
}

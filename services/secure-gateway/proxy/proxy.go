package proxy

import (
	"net/http"
	"net/url"

	"github.com/urfave/negroni"
	"github.com/vulcand/oxy/forward"
)

// New creates a new Proxy Middleware to forward the requests
func New(upstream *url.URL) negroni.HandlerFunc {
	fwd, _ := forward.New()
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		patchUpstream(r, upstream)
		fwd.ServeHTTP(rw, r)
		if next != nil {
			next(rw, r)
		}
	}
}

// FromStringURL create a new Proxy Middleware to forward the requests
func FromStringURL(upstream string) negroni.HandlerFunc {
	newURL, err := url.Parse(upstream)
	if err != nil {
		panic(err)
	}
	return New(newURL)
}

func patchUpstream(request *http.Request, upstream *url.URL) {
	newURL := upstream.ResolveReference(request.URL)
	request.URL = newURL
	request.RequestURI = newURL.RequestURI()
}

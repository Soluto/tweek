package proxy

import (
	"fmt"
	"net/http"
	"net/http/httputil"
	"net/url"

	"github.com/Soluto/tweek/services/gateway/security"

	"github.com/urfave/negroni"
)

// New creates a new Proxy Middleware to forward the requests
func New(upstream *url.URL, token security.JWTToken) negroni.HandlerFunc {
	proxy := httputil.NewSingleHostReverseProxy(upstream) // // net / http / httputil.NewSingleHostReverseProxy(upstream) //NewSingleHostReverseProxy(upstream)

	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		rw.Header().Set("X-GATEWAY", "true")
		patchUpstream(r, upstream)
		r.Header.Del("Origin")
		if token != nil {
			setJwtToken(r, token.GetToken())
		}
		proxy.ServeHTTP(rw, r)
		if next != nil {
			next(rw, r)
		}
	}
}

// FromStringURL create a new Proxy Middleware to forward the requests
func FromStringURL(upstream string, token security.JWTToken) negroni.HandlerFunc {
	newURL, err := url.Parse(upstream)
	if err != nil {
		panic(err)
	}
	return New(newURL, token)
}

func patchUpstream(request *http.Request, upstream *url.URL) {
	newURL := upstream.ResolveReference(request.URL)
	request.URL = newURL
	request.RequestURI = newURL.RequestURI()
}

func setJwtToken(r *http.Request, tokenStr string) {
	r.Header.Set("Authorization", fmt.Sprintf("Bearer %v", tokenStr))
}

package transformation

import (
	"io"
	"net/http"

	"github.com/urfave/negroni"

	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
	"github.com/Soluto/tweek/services/secure-gateway/proxy"
	"github.com/Soluto/tweek/services/secure-gateway/security"
)

// NewHealthHandler return /health endpoint handler
func NewHealthHandler(upstreams *appConfig.Upstreams, token security.JWTToken, middleware *negroni.Negroni) http.Handler {
	api := parseUpstreamOrPanic(upstreams.API)
	authoring := parseUpstreamOrPanic(upstreams.Authoring)
	publishing := parseUpstreamOrPanic(upstreams.Publishing)

	// Proxy forwarders
	apiForwarder := middleware.With(proxy.New(api, token))
	authoringForwarder := middleware.With(proxy.New(authoring, token))
	publishingForwarder := middleware.With(proxy.New(publishing, token))
	return http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
		switch r.Host {
		case "api":
			apiForwarder.ServeHTTP(rw, r)
		case "authoring":
			authoringForwarder.ServeHTTP(rw, r)
		case "publishing":
			publishingForwarder.ServeHTTP(rw, r)
		default:
			rw.WriteHeader(http.StatusOK)
			io.WriteString(rw, "OK")
		}
	})
}

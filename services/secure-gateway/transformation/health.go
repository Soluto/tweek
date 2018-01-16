package transformation

import (
	"io"
	"net/http"

	"github.com/urfave/negroni"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	"github.com/Soluto/tweek/services/secure-gateway/proxy"
	"github.com/Soluto/tweek/services/secure-gateway/security"
)

// NewHealthHandler return /health endpoint handler
func NewHealthHandler(upstreams *config.Upstreams, token security.JWTToken, middleware *negroni.Negroni) http.Handler {
	api := parseUpstreamOrPanic(upstreams.API)
	authoring := parseUpstreamOrPanic(upstreams.Authoring)
	management := parseUpstreamOrPanic(upstreams.Management)

	// Proxy forwarders
	apiForwarder := middleware.With(proxy.New(api, token))
	authoringForwarder := middleware.With(proxy.New(authoring, token))
	managementForwarder := middleware.With(proxy.New(management, token))
	return http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
		switch r.Host {
		case "api":
			apiForwarder.ServeHTTP(rw, r)
		case "authoring":
			authoringForwarder.ServeHTTP(rw, r)
		case "management":
			managementForwarder.ServeHTTP(rw, r)
		default:
			rw.WriteHeader(http.StatusOK)
			io.WriteString(rw, "OK")
		}
	})
}

package transformation

import (
	"io"
	"log"
	"net/http"

	"github.com/urfave/negroni"

	"github.com/Soluto/tweek/services/gateway/appConfig"
	"github.com/Soluto/tweek/services/gateway/proxy"
	"github.com/Soluto/tweek/services/gateway/security"
)

// NewHealthHandler return /health endpoint handler
func NewHealthHandler(upstreams *appConfig.Upstreams, token security.JWTToken, middleware *negroni.Negroni) http.Handler {
	api := parseUpstreamOrPanic(upstreams.API)
	authoring := parseUpstreamOrPanic(upstreams.Authoring)

	// Proxy forwarders
	apiForwarder := middleware.With(proxy.New(api, token))
	authoringForwarder := middleware.With(proxy.New(authoring, token))
	return http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
		log.Print("Health check")
		switch r.Host {
		case "api":
			log.Print("API Health check")
			apiForwarder.ServeHTTP(rw, r)
		case "authoring":
			log.Print("Authoring Health check")
			authoringForwarder.ServeHTTP(rw, r)
		default:
			log.Print("Gateway Health check")
			rw.WriteHeader(http.StatusOK)
			io.WriteString(rw, "OK")
		}
	})
}

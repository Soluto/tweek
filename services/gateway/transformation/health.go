package transformation

import (
	"github.com/sirupsen/logrus"
	"github.com/urfave/negroni"
	"io"
	"net/http"
	"tweek-gateway/appConfig"
	"tweek-gateway/proxy"
	"tweek-gateway/security"
)

// NewHealthHandler return /health endpoint handler
func NewHealthHandler(upstreams *appConfig.Upstreams, token security.JWTToken, middleware *negroni.Negroni) http.Handler {
	api := parseUpstreamOrPanic(upstreams.API)
	authoring := parseUpstreamOrPanic(upstreams.Authoring)

	// Proxy forwarders
	apiForwarder := middleware.With(proxy.New(api, token))
	authoringForwarder := middleware.With(proxy.New(authoring, token))
	return http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
		logrus.Info("Health check")
		switch r.Host {
		case "api":
			logrus.Info("API Health check")
			apiForwarder.ServeHTTP(rw, r)
		case "authoring":
			logrus.Info("Authoring Health check")
			authoringForwarder.ServeHTTP(rw, r)
		default:
			logrus.Info("Gateway Health check")
			rw.WriteHeader(http.StatusOK)
			io.WriteString(rw, "OK")
		}
	})
}

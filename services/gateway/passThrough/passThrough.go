package passThrough

import (
	"net/url"

	"github.com/sirupsen/logrus"

	"tweek-gateway/metrics"
	"tweek-gateway/proxy"

	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
)

func prepareMiddleware(upstream string, metricsName string, metricsVar *metrics.Metrics) []negroni.Handler {
	parsedUpstream := parseUpstreamOrPanic(upstream)

	var handlers = []negroni.Handler{}

	// metrics
	metricHandlers := metricsVar.NewMetricsMiddleware(metricsName)
	for i := range metricHandlers {
		handlers = append(handlers, metricHandlers[i])
	}
	
	// Proxy forwarder
	handlers = append(handlers, proxy.New(parsedUpstream, nil))

	return handlers
}

// MountWithoutHost - mounts the request passThrough handlers and middleware
func MountWithoutHost(upstream, metricsName string, middleware *negroni.Negroni, metricsVar *metrics.Metrics, router *mux.Router) {
	handlers := prepareMiddleware(upstream, metricsName, metricsVar)

	// Mounting handler
	router.PathPrefix("/").Handler(middleware.With(handlers...))
}

// MountWithHosts - mounts the request passThrough handlers and middleware
func MountWithHosts(upstream string, hosts []string, metricsName string, middleware *negroni.Negroni, metricsVar *metrics.Metrics, router *mux.Router) {
	handlers := prepareMiddleware(upstream, metricsName, metricsVar)

	// Mounting handler
	for _, host := range hosts {
		router.Host(host).Handler(middleware.With(handlers...))
	}
}

func parseUpstreamOrPanic(u string) *url.URL {
	result, err := url.Parse(u)
	if err != nil {
		logrus.WithError(err).WithField("upstream", u).Panic("Invalid upstream")
	}
	return result
}

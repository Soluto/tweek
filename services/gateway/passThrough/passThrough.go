package passThrough

import (
	"net/url"

	"github.com/sirupsen/logrus"

	"github.com/prometheus/client_golang/prometheus"

	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
	"tweek-gateway/metrics"
	"tweek-gateway/proxy"
)

// MountWithoutHost - mounts the request passThrough handlers and middleware
func MountWithoutHost(upstream, metricsName string, middleware *negroni.Negroni, metricsVar *prometheus.SummaryVec, router *mux.Router) {
	parsedUpstream := parseUpstreamOrPanic(upstream)

	// Proxy forwarder
	forwarder := proxy.New(parsedUpstream, nil)

	// metrics
	forwarderMetrics := metrics.NewMetricsMiddleware(metricsName, metricsVar)

	// Mounting handler
	router.PathPrefix("/").Handler(middleware.With(forwarderMetrics, forwarder))
}

// MountWithHosts - mounts the request passThrough handlers and middleware
func MountWithHosts(upstream string, hosts []string, metricsName string, middleware *negroni.Negroni, metricsVar *prometheus.SummaryVec, router *mux.Router) {
	parsedUpstream := parseUpstreamOrPanic(upstream)

	// Proxy forwarder
	forwarder := proxy.New(parsedUpstream, nil)

	// metrics
	forwarderMetrics := metrics.NewMetricsMiddleware(metricsName, metricsVar)

	// Mounting handler
	for _, host := range hosts {
		router.Host(host).Handler(middleware.With(forwarderMetrics, forwarder))
	}
}

func parseUpstreamOrPanic(u string) *url.URL {
	result, err := url.Parse(u)
	if err != nil {
		logrus.WithError(err).WithField("upstream", u).Panic("Invalid upstream")
	}
	return result
}

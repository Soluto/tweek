package metrics

import (
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/urfave/negroni"
)

// NewMetricsVar creates the new metrics histogram
func NewMetricsVar(subsystem string) *prometheus.HistogramVec {
	var metrics = prometheus.NewHistogramVec(prometheus.HistogramOpts{
		Subsystem: subsystem,
		Name:      "request_duration_seconds",
		Help:      "Total time spent serving requests.",
	}, []string{"upstream", "method"})

	prometheus.MustRegister(metrics)
	return metrics
}

// NewMetricsMiddleware creates a new metrics middleware
func NewMetricsMiddleware(label string, metric *prometheus.HistogramVec) negroni.HandlerFunc {

	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		defer func(begin time.Time) { metric.WithLabelValues(label, r.Method).Observe(time.Since(begin).Seconds()) }(time.Now())
		next(rw, r)
	}
}

package metrics

import (
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/urfave/negroni"
)

// NewMetricsVar creates the new metrics histogram
func NewMetricsVar(subsystem string) *prometheus.SummaryVec {
	var metrics = prometheus.NewSummaryVec(prometheus.SummaryOpts{
		Subsystem:  subsystem,
		Name:       "request_duration_seconds",
		Help:       "Total time spent serving requests.",
		Objectives: map[float64]float64{0.5: 0.05, 0.75: 0.001, 0.9: 0.01, 0.95: 0.001, 0.99: 0.001},
	}, []string{"upstream", "method"})

	prometheus.MustRegister(metrics)
	return metrics
}

// NewMetricsMiddleware creates a new metrics middleware
func NewMetricsMiddleware(label string, metric *prometheus.SummaryVec) negroni.HandlerFunc {

	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		defer func(begin time.Time) { metric.WithLabelValues(label, r.Method).Observe(time.Since(begin).Seconds()) }(time.Now())
		next(rw, r)
	}
}

package metrics

import (
	"net/http"
	"strconv"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/urfave/negroni"
)

type summary struct {
	*prometheus.SummaryVec
}

type responseWriterInterceptor struct {
	http.ResponseWriter
	statusCode int
}

func (w *responseWriterInterceptor) WriteHeader(statusCode int) {
	w.statusCode = statusCode
	w.ResponseWriter.WriteHeader(statusCode)
}

func newSummary(subsystem string) *summary {
	var summaryVec = prometheus.NewSummaryVec(prometheus.SummaryOpts{
		Subsystem:  subsystem,
		Name:       "request_duration_seconds",
		Help:       "Total time spent serving requests.",
		Objectives: map[float64]float64{0.5: 0.05, 0.75: 0.01, 0.9: 0.01, 0.95: 0.001, 0.99: 0.001},
	}, []string{"upstream", "method", "status_code"})
	prometheus.MustRegister(summaryVec)

	return &summary{
		summaryVec,
	}
}

func (metric *summary) newSummaryMiddleware(label string) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		rwi := &responseWriterInterceptor{
			rw,
			http.StatusOK,
		}
		defer func(begin time.Time) {
			metric.WithLabelValues(label, r.Method, strconv.Itoa(rwi.statusCode)).Observe(time.Since(begin).Seconds())
		}(time.Now())
		next(rwi, r)
	}
}

type histogram struct {
	*prometheus.HistogramVec
}

func newHistogram(subsystem string) *histogram {
	var histogramVec = prometheus.NewHistogramVec(prometheus.HistogramOpts{
		Subsystem: subsystem,
		Name:      "request_duration_seconds_histogram",
		Help:      "Total time spent serving requests.",
	}, []string{"upstream", "method", "status_code"})
	prometheus.MustRegister(histogramVec)

	return &histogram{
		histogramVec,
	}
}

func (metric *histogram) newHistogramMiddleware(label string) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		rwi := &responseWriterInterceptor{
			rw,
			http.StatusOK,
		}
		defer func(begin time.Time) {
			metric.WithLabelValues(label, r.Method, strconv.Itoa(rwi.statusCode)).Observe(time.Since(begin).Seconds())
		}(time.Now())
		next(rwi, r)
	}
}

// Metrics object that holds all metrics
type Metrics struct {
	*summary
	*histogram
}

// NewMetricsVar create Metrics object
func NewMetricsVar(subsystem string) *Metrics {
	return &Metrics{
		summary:   newSummary(subsystem),
		histogram: newHistogram(subsystem),
	}
}

// NewMetricsMiddleware creates and returns handlers for every type of metrics
func (m *Metrics) NewMetricsMiddleware(label string) []negroni.HandlerFunc {
	return []negroni.HandlerFunc{
		m.histogram.newHistogramMiddleware(label),
		m.summary.newSummaryMiddleware(label),
	}
}

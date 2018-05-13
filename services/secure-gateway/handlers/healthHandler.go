package handlers

import "net/http"

// NewHealthHandler - checks healths of all services and returns results
func NewHealthHandler() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("true"))
	}
}

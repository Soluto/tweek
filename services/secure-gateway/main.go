package main

import (
	"net/http"

	"github.com/Soluto/tweek/services/secure-gateway/transformation"
)

func main() {
	router := transformation.NewRouter()

	// that's it! our reverse proxy is ready!
	s := &http.Server{
		Addr:    ":9090",
		Handler: router,
	}
	s.ListenAndServe()
}

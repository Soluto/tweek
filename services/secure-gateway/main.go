package main

import (
	"net/http"

	"github.com/Soluto/tweek/services/secure-gateway/transformation"
	"github.com/urfave/negroni"
)

func main() {
	upstreams := &transformation.UpstreamsConfig{
		APIUpstream: "http://localhost:8090/",
	}

	router := transformation.New(upstreams)
	app := negroni.New(negroni.NewRecovery())
	app.UseHandler(router)

	s := &http.Server{
		Addr:    ":9090",
		Handler: app,
	}
	s.ListenAndServe()
}

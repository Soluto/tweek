package main

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	"github.com/Soluto/tweek/services/secure-gateway/security"
	"github.com/Soluto/tweek/services/secure-gateway/transformation"

	"github.com/urfave/negroni"
)

func main() {
	configuration := config.LoadFromFile("gateway.json")

	router := transformation.New(configuration.Upstreams)
	app := negroni.New(negroni.NewRecovery(), security.UserInfoMiddleware(configuration.Security))
	app.UseHandler(router)

	s := &http.Server{
		Addr:    fmt.Sprintf(":%v", configuration.Server.Port),
		Handler: app,
	}

	log.Printf("Secure Gateway is listening on port %v", configuration.Server.Port)
	err := s.ListenAndServe()
	if err != nil {
		panic(err)
	}
}

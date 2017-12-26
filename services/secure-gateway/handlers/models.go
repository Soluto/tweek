package handlers

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/casbin/casbin"
	"github.com/casbin/json-adapter"

	"github.com/urfave/negroni"
)

// NewModelsRead is a handler for reading policies
func NewModelsRead(enforcer *casbin.SyncedEnforcer) negroni.Handler {
	return negroni.WrapFunc(func(rw http.ResponseWriter, r *http.Request) {
		model := enforcer.GetModel()
		buffer := []byte{}
		jsAdapter := jsonadapter.NewAdapter(&buffer)
		if err := jsAdapter.SavePolicy(model); err != nil {
			log.Println("Error deserializing json", err)
			panic("Error deserializing json")
		}

		output := string(buffer)
		rw.Header().Set("Content-Type", "application/json; charset=utf-8")
		rw.Header().Set("Content-Length", fmt.Sprint(len(output)))
		rw.Header().Set("X-Content-Type-Options", "nosniff")
		rw.WriteHeader(http.StatusOK)
		fmt.Fprint(rw, output)
	})
}

// NewModelsWrite is a handler for reading policies
func NewModelsWrite(enforcer *casbin.SyncedEnforcer) negroni.Handler {
	return negroni.WrapFunc(func(rw http.ResponseWriter, r *http.Request) {
		buffer, err := ioutil.ReadAll(r.Body)
		if err != nil {
			log.Println("Error reading request body", err)
			panic("Error reading request body")
		}

		jsAdapter := jsonadapter.NewAdapter(&buffer)
		jsAdapter.LoadPolicy(enforcer.GetModel())

		rw.WriteHeader(http.StatusOK)
	})
}

package main

import (
	"bytes"
	"io"
	"io/ioutil"
	"log"
	"net/http"
)

func swaggerHandler() http.HandlerFunc {
	data, err := ioutil.ReadFile("/swagger/swagger.yml")
	if err != nil {
		log.Panicln("Couldn't load /swagger/swagger.yml")
	}
	dataReader := bytes.NewReader(data)

	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-type", "application/yaml")
		w.WriteHeader(http.StatusOK)
		_, err = io.Copy(w, dataReader)
		if err != nil {
			log.Println("Failed to output swagger.yml")
		}
	}
}

package main

import (
	"bytes"
	"io"
	"io/ioutil"
	"net/http"

	"github.com/sirupsen/logrus"
)

func swaggerHandler() http.HandlerFunc {
	data, err := ioutil.ReadFile("./swagger/swagger.yml")
	if err != nil {
		logrus.Panic("Couldn't load /swagger/swagger.yml")
	}
	dataReader := bytes.NewReader(data)

	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-type", "application/yaml")
		w.WriteHeader(http.StatusOK)
		_, err = io.Copy(w, dataReader)
		if err != nil {
			logrus.Error("Failed to output swagger.yml")
		}
	}
}

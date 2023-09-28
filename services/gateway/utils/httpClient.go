package utils

import (
	"crypto/tls"
	"net/http"
	"tweek-gateway/appConfig"
)

func GetHttpClient() *http.Client {
	// Ignore TLS errors for development
	if !appConfig.IsProduction() {
		tr := &http.Transport{
			TLSClientConfig: &tls.Config{InsecureSkipVerify: true},
		}
		return &http.Client{Transport: tr}
	}
	return http.DefaultClient
}

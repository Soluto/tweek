package main

import (
	"net/http"
	"os"
)

func main() {
	_, err := http.Get("http://localhost/api/monitoring/isAlive")
	if err != nil {
		os.Exit(1)
	}
}

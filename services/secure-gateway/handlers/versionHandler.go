package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"

	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
)

type serviceInfo struct {
	Version string `json:"version"`
	Status  string `json:"status"`
}

// NewVersionHandler - handler function that returns versions for all services
func NewVersionHandler(config *appConfig.Upstreams, selfVersion string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var wg sync.WaitGroup
		versions := map[string]*serviceInfo{
			"api":        getServiceInfo(config.API, &wg),
			"authoring":  getServiceInfo(config.Authoring, &wg),
			"publishing": getServiceInfo(config.Publishing, &wg),
			"gateway":    &serviceInfo{selfVersion, "healthy"},
		}
		wg.Wait()

		js, err := json.Marshal(versions)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(js)
	}
}

func getServiceInfo(serviceHost string, wg *sync.WaitGroup) *serviceInfo {
	svcInfo := &serviceInfo{}

	wg.Add(1)
	go func(host string) {
		defer wg.Done()
		svcInfo.Status = getServiceHealth(host)
	}(serviceHost)

	wg.Add(1)
	go func(host string) {
		defer wg.Done()
		svcInfo.Version = getServiceVersion(host)
	}(serviceHost)
	return svcInfo
}

func getServiceVersion(serviceHost string) string {
	resp, err := http.Get(fmt.Sprintf("%s/version", serviceHost))
	if err != nil || resp.StatusCode != http.StatusOK {
		return "error"
	}
	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	return string(body)
}

func getServiceHealth(serviceHost string) string {
	resp, err := http.Get(fmt.Sprintf("%s/health", serviceHost))
	if err != nil || resp.StatusCode != http.StatusOK {
		return "unhealthy"
	}
	return "healthy"
}

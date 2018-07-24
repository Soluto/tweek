package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"sync"

	"github.com/Soluto/tweek/services/gateway/appConfig"
)

// NewStatusHandler - handler function that returns versions for all services
func NewStatusHandler(config *appConfig.Upstreams) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var wg sync.WaitGroup
		versions := map[string]*serviceInfo{
			"api":        getServiceStatus(config.API, &wg),
			"authoring":  getServiceStatus(config.Authoring, &wg),
			"publishing": getServiceStatus(config.Publishing, &wg),
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

func getServiceStatus(serviceHost string, wg *sync.WaitGroup) *serviceInfo {
	svcInfo := &serviceInfo{}

	wg.Add(1)
	go func(host string) {
		defer wg.Done()
		svcInfo.Status = callServiceHealthEndpoint(host)
	}(serviceHost)
	return svcInfo
}

func callServiceHealthEndpoint(serviceHost string) string {
	resp, err := http.Get(fmt.Sprintf("%s/health", serviceHost))
	if err != nil || resp.StatusCode != http.StatusOK {
		return "unhealthy"
	}
	defer resp.Body.Close()
	contents, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "bad response"
	}
	return string(contents)
}

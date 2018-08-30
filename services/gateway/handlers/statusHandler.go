package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"sync"

	"github.com/Soluto/tweek/services/gateway/appConfig"
)

// NewStatusHandler - handler function that returns versions for all services
func NewStatusHandler(config *appConfig.Upstreams) http.HandlerFunc {
	services := map[string]string{
		"api":        config.API,
		"authoring":  config.Authoring,
		"publishing": config.Publishing,
	}
	return func(w http.ResponseWriter, r *http.Request) {
		var wg sync.WaitGroup
		wg.Add(len(services))

		serviceStatuses := map[string]interface{}{}

		for serviceName, serviceHost := range services {
			go func(name, host string, statuses map[string]interface{}, wgroup *sync.WaitGroup) {
				checkServiceStatus(name, host, statuses)
				wgroup.Done()
			}(serviceName, serviceHost, serviceStatuses, &wg)
		}
		wg.Wait()

		js, err := json.Marshal(serviceStatuses)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(js)
	}
}

func checkServiceStatus(serviceName string, serviceHost string, statuses map[string]interface{}) {
	resp, err := http.Get(fmt.Sprintf("%s/health", serviceHost))
	if err != nil || resp == nil {
		log.Printf("Service health request for %s failed with error: %v\n", serviceName, err)
		statuses[serviceName] = "Service health request failed"
		return
	}
	defer resp.Body.Close()
	contents, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Printf("Service health request for %s read failed with error: %v\n", serviceName, err)
		statuses[serviceName] = "Service health request cannot be read"
		return
	}
	var status map[string]interface{}
	err = json.Unmarshal(contents, &status)
	if err != nil {
		log.Printf("Service health request for %s JSON parse failed with error: %v\n", serviceName, err)
		statuses[serviceName] = "Service health request responded with bad format"
		return
	}
	statuses[serviceName] = status
}

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
			go checkServiceStatus(serviceName, serviceHost, serviceStatuses, &wg)
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

func checkServiceStatus(serviceName string, serviceHost string, statuses map[string]interface{}, wg *sync.WaitGroup) {
	defer wg.Done()
	resp, err := http.Get(fmt.Sprintf("%s/health", serviceHost))
	if err != nil || resp.StatusCode != http.StatusOK {
		fmt.Printf("Service health request for %s failed with error: %v\n", serviceName, err)
		statuses[serviceName] = "Service health request failed"
		return
	}
	defer resp.Body.Close()
	contents, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("Service health request for %s read failed with error: %v\n", serviceName, err)
		statuses[serviceName] = "Service health request cannot be read"
		return
	}
	var status map[string]interface{}
	err = json.Unmarshal(contents, &status)
	if err != nil {
		fmt.Printf("Service health request for %s JSON parse failed with error: %v\n", serviceName, err)
		statuses[serviceName] = "Service health request responded with bad format"
		return
	}
	statuses[serviceName] = status
}

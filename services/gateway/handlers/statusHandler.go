package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"runtime"
	"sync"

	"github.com/sirupsen/logrus"

	nats "github.com/nats-io/go-nats"

	"tweek-gateway/appConfig"
)

var repoRevision string

func toMap(sm *sync.Map) map[string]interface{} {
	m := map[string]interface{}{}
	sm.Range(func(k interface{}, v interface{}) bool {
		m[k.(string)] = v
		return true
	})
	return m
}

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

		result := map[string]interface{}{}
		var serviceStatuses sync.Map
		isHealthy := true

		for serviceName, serviceHost := range services {
			go func(name, host string) {
				serviceStatus, serviceIsHealthy := checkServiceStatus(name, host)
				serviceStatuses.Store(name, serviceStatus)
				if !serviceIsHealthy {
					isHealthy = false
				}
				wg.Done()
			}(serviceName, serviceHost)
		}
		wg.Wait()

		result["services"] = toMap(&serviceStatuses)
		result["repository revision"] = repoRevision

		if !isHealthy {
			result["message"] = "not all services are healthy"
		}

		js, err := json.Marshal(result)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		if !isHealthy {
			w.WriteHeader(http.StatusServiceUnavailable)
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(js)
	}
}

// SetupRevisionUpdater creates revision updater
func SetupRevisionUpdater(natsEndpoint string) {
	nc, err := nats.Connect(natsEndpoint)
	if err != nil {
		logrus.WithField("natsEndpoint", natsEndpoint).Panic("Failed to connect to nats")
	}

	sub, err := nc.Subscribe("version", func(msg *nats.Msg) {
		repoRevision = string(msg.Data)
	})
	if err != nil {
		logrus.WithField("natsEndpoint", natsEndpoint).Panic("Failed to subscribe to subject 'version'")
	}
	runtime.SetFinalizer(&repoRevision, func(interface{}) {
		if sub != nil && sub.IsValid() {
			sub.Unsubscribe()
		}
	})
}

func checkServiceStatus(serviceName string, serviceHost string) (interface{}, bool) {
	resp, err := http.Get(fmt.Sprintf("%s/health", serviceHost))

	if err != nil || resp == nil {
		logrus.WithError(err).WithField("serviceName", serviceName).Error("Service health request failed")
		return "Service health request failed", false
	}
	defer resp.Body.Close()
	contents, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		logrus.WithError(err).WithField("serviceName", serviceName).Error("Service health request: read failed")
		return "Service health request cannot be read", false
	}
	var status map[string]interface{}
	err = json.Unmarshal(contents, &status)
	if err != nil {
		logrus.WithError(err).WithField("serviceName", serviceName).Error("Service health request: JSON parse failed")
		return "Service health request responded with bad format", false
	}
	if resp.StatusCode > 400 {
		return status, false
	}
	return status, true
}

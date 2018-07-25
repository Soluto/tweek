package handlers

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/Soluto/tweek/services/gateway/appConfig"
)

// NewStatusHandler - handler function that returns versions for all services
func NewStatusHandler(config *appConfig.Upstreams) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		versions := map[string]interface{}{
			"api":        getServiceStatus(config.API),
			"authoring":  getServiceStatus(config.Authoring),
			"publishing": getServiceStatus(config.Publishing),
		}

		js, err := json.Marshal(versions)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(js)
	}
}

func getServiceStatus(serviceHost string) map[string]interface{} {
	resp, err := http.Get(fmt.Sprintf("%s/health", serviceHost))
	if err != nil || resp.StatusCode != http.StatusOK {
		return nil
	}

	defer resp.Body.Close()
	contents, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil
	}

	var status map[string]interface{}
	err = json.Unmarshal(contents, &status)
	if err != nil {
		return nil
	}

	return status
}

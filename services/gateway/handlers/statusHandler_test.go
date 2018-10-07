package handlers

import (
	"encoding/json"
	"reflect"
	"testing"

	"gopkg.in/h2non/gock.v1"
)

const HOST = "http://myservice.com"

func Test_checkServiceStatus(t *testing.T) {
	type args struct {
		serviceName       string
		responseCode      int
		responseBody      map[string]interface{}
		expectedStatus    map[string]interface{}
		expectedIsHealthy bool
	}

	tests := []struct {
		name string
		args args
	}{
		{
			name: "HTTP Response Status 200",
			args: args{
				serviceName:       "Healthy Server",
				responseCode:      200,
				responseBody:      map[string]interface{}{},
				expectedStatus:    map[string]interface{}{},
				expectedIsHealthy: true,
			},
		},
		{
			name: "HTTP Response Status 500",
			args: args{
				serviceName:       "Unhealthy Server",
				responseCode:      500,
				responseBody:      map[string]interface{}{"unhealthy": "I'm unhealthy"},
				expectedStatus:    map[string]interface{}{"unhealthy": "I'm unhealthy"},
				expectedIsHealthy: false,
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {

			gock.New(HOST).Get("/health").Reply(tt.args.responseCode).JSON(tt.args.responseBody)
			defer gock.Off()
			status, isHealthy := checkServiceStatus(tt.args.serviceName, HOST)
			println(isHealthy)
			val, err := json.Marshal(status)
			if err == nil {
				println(string(val))
			} else {
				println(err)
			}

			if !reflect.DeepEqual(status, tt.args.expectedStatus) || isHealthy != tt.args.expectedIsHealthy {
				t.Fatal()
			}
		})
	}
}

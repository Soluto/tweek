package handlers

import (
	"fmt"
	"reflect"
	"testing"

	"gopkg.in/h2non/gock.v1"
)

const HOST = "http://myservice.com"

func Test_checkServiceStatus(t *testing.T) {
	type args struct {
		serviceName      string
		responseCode     int
		responseBody     map[string]interface{}
		expectedStatuses map[string]interface{}
	}

	tests := []struct {
		name string
		args args
	}{
		{
			name: "HTTP Response Status 200",
			args: args{
				serviceName:  "Healthy Server",
				responseCode: 200,
				responseBody: map[string]interface{}{},
				expectedStatuses: map[string]interface{}{
					"Healthy Server": map[string]interface{}{},
				},
			},
		},
		{
			name: "HTTP Response Status 500",
			args: args{
				serviceName:  "Unhealthy Server",
				responseCode: 500,
				responseBody: map[string]interface{}{"unhealthy": "I'm unhealthy"},
				expectedStatuses: map[string]interface{}{
					"Unhealthy Server": map[string]interface{}{"unhealthy": "I'm unhealthy"},
				},
			},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gock.New(HOST).Get("/health").Reply(tt.args.responseCode).JSON(tt.args.responseBody)
			defer gock.Off()
			statuses := map[string]interface{}{}
			checkServiceStatus(tt.args.serviceName, HOST, statuses)

			fmt.Printf("Received %#v\n", statuses)
			fmt.Printf("Expected %#v\n", tt.args.expectedStatuses)

			if !reflect.DeepEqual(statuses, tt.args.expectedStatuses) {
				t.Fatal()
			}
		})
	}
}

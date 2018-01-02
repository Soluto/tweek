package transformation

import (
	"io"
	"net/http"
	"net/url"
	"reflect"
	"testing"
)

func Test_getContextURLByRequest(t *testing.T) {
	type args struct {
		upstream *url.URL
		req      *http.Request
	}

	apiURL := parseURL(t, "http://api")

	tests := []struct {
		name string
		args args
		want *url.URL
	}{
		{
			name: "GetContext request",
			args: args{
				apiURL,
				makeRequest(t, "GET", "http://gateway/api/v2/context/IdnType/IdnId", nil),
			},
			want: parseURL(t, "http://api/api/v1/context/IdnType/IdnId"),
		},
		{
			name: "DeleteContext request",
			args: args{
				apiURL,
				makeRequest(t, "DELETE", "http://gateway/api/v2/context/IdnType/IdnId/prop", nil),
			},
			want: parseURL(t, "http://api/api/v1/context/IdnType/IdnId/prop"),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getContextURLForUpstream(tt.args.upstream, tt.args.req); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("getConfigurationURLByRequest() = %v, want %v", got, tt.want)
			}
		})
	}
}

func parseContextURL(t *testing.T, urlString string) *url.URL {
	result, err := url.Parse(urlString)
	if err != nil {
		t.Fatal(err)
	}
	return result
}

func makeContextRequest(t *testing.T, method string, url string, body io.Reader) *http.Request {
	result, err := http.NewRequest(method, url, body)
	if err != nil {
		t.Fatal(err)
	}
	return result
}

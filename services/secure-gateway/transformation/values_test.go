package transformation

import (
	"io"
	"net/http"
	"net/url"
	"reflect"
	"testing"
)

func Test_getValuesURLByRequest(t *testing.T) {
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
			name: "Simple request",
			args: args{
				apiURL,
				makeRequest(t, "GET", "http://gateway/api/v2/values/a/b/c", nil),
			},
			want: parseURL(t, "http://api/api/v1/keys/a/b/c"),
		},
		{
			name: "$flatten request",
			args: args{
				apiURL,
				makeRequest(t, "GET", "http://gateway/api/v2/values/d/e/f?%24flatten=true", nil),
			},
			want: parseURL(t, "http://api/api/v1/keys/d/e/f?%24flatten=true"),
		},
		{
			name: "$include request",
			args: args{
				apiURL,
				makeRequest(t, "GET", "http://gateway/api/v2/values/u/v/r?%24flatten=true&%24include=/x/y/z", nil),
			},
			want: parseURL(t, "http://api/api/v1/keys/u/v/r?%24flatten=true&%24include=/x/y/z"),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getValuesURLByRequest(tt.args.upstream, tt.args.req); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("getConfigurationURLByRequest() = %v, want %v", got, tt.want)
			}
		})
	}
}

func parseURL(t *testing.T, urlString string) *url.URL {
	result, err := url.Parse(urlString)
	if err != nil {
		t.Fatal(err)
	}
	return result
}

func makeRequest(t *testing.T, method string, url string, body io.Reader) *http.Request {
	result, err := http.NewRequest(method, url, body)
	if err != nil {
		t.Fatal(err)
	}
	return result
}

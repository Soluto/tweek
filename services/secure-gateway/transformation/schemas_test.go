package transformation

import (
	"io"
	"net/http"
	"net/url"
	"reflect"
	"testing"
)

func Test_getSchemasURLByRequest(t *testing.T) {
	type args struct {
		upstream *url.URL
		req      *http.Request
	}

	authoringURL := parseSchemasURL(t, "http://authoring")

	tests := []struct {
		name string
		args args
		want *url.URL
	}{
		{
			name: "GetSchemas request",
			args: args{
				authoringURL,
				makeSchemasRequest(t, "GET", "http://gateway/api/v2/schemas", nil),
			},
			want: parseSchemasURL(t, "http://authoring/api/v1/schemas"),
		},
		{
			name: "DeleteSchemas request",
			args: args{
				authoringURL,
				makeSchemasRequest(t, "DELETE", "http://gateway/api/v2/schemas/IdnType", nil),
			},
			want: parseSchemasURL(t, "http://authoring/api/v1/schemas/IdnType"),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getSchemasURLForUpstream(tt.args.upstream, tt.args.req); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("getConfigurationURLByRequest() = %v, want %v", got, tt.want)
			}
		})
	}
}

func parseSchemasURL(t *testing.T, urlString string) *url.URL {
	result, err := url.Parse(urlString)
	if err != nil {
		t.Fatal(err)
	}
	return result
}

func makeSchemasRequest(t *testing.T, method string, url string, body io.Reader) *http.Request {
	result, err := http.NewRequest(method, url, body)
	if err != nil {
		t.Fatal(err)
	}
	return result
}

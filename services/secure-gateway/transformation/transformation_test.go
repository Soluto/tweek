package transformation

import (
	"io"
	"net/http"
	"net/http/httptest"
	"net/url"
	"reflect"
	"regexp"
	"testing"
)

func Test_getURLForUpstream(t *testing.T) {
	type args struct {
		upstream          *url.URL
		req               *http.Request
		urlRegexp         *regexp.Regexp
		replaceURLSegment string
	}

	apiURL, _ := url.Parse("http://api")
	authoringURL, _ := url.Parse("http://authoring")

	tests := []struct {
		name string
		args args
		want *url.URL
	}{
		{
			name: "Simple request",
			args: args{
				apiURL,
				httptest.NewRequest("GET", "/api/v2/values/a/b/c", nil),
				valuesURLRegexp,
				valuesUpstreamRoute,
			},
			want: parseURL(t, "http://api/api/v1/keys/a/b/c"),
		},
		{
			name: "$flatten request",
			args: args{
				apiURL,
				httptest.NewRequest("GET", "/api/v2/values/d/e/f?%24flatten=true", nil),
				valuesURLRegexp,
				valuesUpstreamRoute,
			},
			want: parseURL(t, "http://api/api/v1/keys/d/e/f?%24flatten=true"),
		},
		{
			name: "$include request",
			args: args{
				apiURL,
				httptest.NewRequest("GET", "/api/v2/values/u/v/r?%24flatten=true&%24include=/x/y/z", nil),
				valuesURLRegexp,
				valuesUpstreamRoute,
			},
			want: parseURL(t, "http://api/api/v1/keys/u/v/r?%24flatten=true&%24include=/x/y/z"),
		},

		{
			name: "GetContext request",
			args: args{
				apiURL,
				httptest.NewRequest("GET", "/api/v2/context/IdnType/IdnId", nil),
				contextURLRegexp,
				contextUpstreamRoute,
			},
			want: parseURL(t, "http://api/api/v1/context/IdnType/IdnId"),
		},
		{
			name: "DeleteContext request",
			args: args{
				apiURL,
				httptest.NewRequest("DELETE", "/api/v2/context/IdnType/IdnId/prop", nil),
				contextURLRegexp,
				contextUpstreamRoute,
			},
			want: parseURL(t, "http://api/api/v1/context/IdnType/IdnId/prop"),
		},
		{
			name: "Get Tags",
			args: args{
				authoringURL,
				httptest.NewRequest("GET", "/api/v2/tags", nil),
				tagsURLRegexp,
				tagsUpstreamRoute,
			},
			want: parseURL(t, "http://authoring/api/v1/tags"),
		},
		{
			name: "GetSchemas request",
			args: args{
				authoringURL,
				httptest.NewRequest("GET", "/api/v2/schemas", nil),
				schemasURLRegexp,
				schemasUpstreamRoute,
			},
			want: parseURL(t, "http://authoring/api/v1/schemas"),
		},
		{
			name: "DeleteSchemas request",
			args: args{
				authoringURL,
				httptest.NewRequest("DELETE", "/api/v2/schemas/IdnType", nil),
				schemasURLRegexp,
				schemasUpstreamRoute,
			},
			want: parseURL(t, "http://authoring/api/v1/schemas/IdnType"),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getURLForUpstream(tt.args.upstream, tt.args.req, tt.args.urlRegexp, tt.args.replaceURLSegment); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("getURLForUpstream() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_makeRequest(t *testing.T) {
	type args struct {
		t      *testing.T
		method string
		url    string
		body   io.Reader
	}
	tests := []struct {
		name string
		args args
		want *http.Request
	}{
	// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := httptest.NewRequest(tt.args.method, tt.args.url, tt.args.body); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("makeRequest() = %v, want %v", got, tt.want)
			}
		})
	}
}

func parseURL(t *testing.T, urlStr string) *url.URL {
	res, err := url.Parse(urlStr)
	if err != nil {
		t.Fatalf("Error url %v", urlStr)
	}
	return res
}

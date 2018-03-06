package transformation

import (
	"context"
	"net/http"
	"net/http/httptest"
	"net/url"
	"reflect"
	"regexp"
	"testing"

	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
	"github.com/Soluto/tweek/services/secure-gateway/security"
	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
)

func TestMount(t *testing.T) {
	type args struct {
		upstreamConfig *appConfig.Upstreams
		routesConfig   []appConfig.V2Route
		token          security.JWTToken
		middleware     *negroni.Negroni
		router         *mux.Router
	}
	tests := []struct {
		name string
		args args
	}{
	// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			Mount(tt.args.upstreamConfig, tt.args.routesConfig, tt.args.token, tt.args.middleware, tt.args.router)
		})
	}
}

func Test_mountRouteTransform(t *testing.T) {
	type args struct {
		router      *mux.Router
		middleware  *negroni.Negroni
		routeConfig appConfig.V2Route
		upstreams   map[string]*url.URL
		forwarders  map[string]negroni.HandlerFunc
	}
	tests := []struct {
		name string
		args args
	}{
	// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mountRouteTransform(tt.args.router, tt.args.middleware, tt.args.routeConfig, tt.args.upstreams, tt.args.forwarders)
		})
	}
}

func Test_createTransformMiddleware(t *testing.T) {
	type args struct {
		routeConfig appConfig.V2Route
		upstreams   map[string]*url.URL
	}
	tests := []struct {
		name string
		args args
		want negroni.HandlerFunc
	}{
	// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := createTransformMiddleware(tt.args.routeConfig, tt.args.upstreams); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("createTransformMiddleware() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_parseUpstreamOrPanic(t *testing.T) {
	type args struct {
		u string
	}
	tests := []struct {
		name string
		args args
		want *url.URL
	}{
	// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := parseUpstreamOrPanic(tt.args.u); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("parseUpstreamOrPanic() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_getURLForUpstream(t *testing.T) {
	authoringURL, _ := url.Parse("http://authoring")

	type args struct {
		upstream      *url.URL
		req           *http.Request
		urlRegexp     *regexp.Regexp
		upstreamRoute string
	}
	tests := []struct {
		name string
		args args
		want *url.URL
	}{
		{
			name: "Schemas transfrom",
			args: args{
				upstream:      authoringURL,
				req:           httptest.NewRequest("GET", "/api/v2/schemas", nil),
				urlRegexp:     regexp.MustCompile(`^/api/v2/schemas(.*)$`),
				upstreamRoute: "/api/schemas$1",
			},
			want: parseURL(t, "http://authoring/api/schemas"),
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := getURLForUpstream(tt.args.upstream, tt.args.req, tt.args.urlRegexp, tt.args.upstreamRoute); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("getURLForUpstream() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_setQueryParams(t *testing.T) {
	type args struct {
		ctx context.Context
		url *url.URL
		key interface{}
	}
	tests := []struct {
		name string
		args args
	}{
	// TODO: Add test cases.
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setQueryParams(tt.args.ctx, tt.args.url, tt.args.key)
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

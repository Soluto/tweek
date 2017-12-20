package handlers

import (
	"bytes"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/casbin/casbin"
	"github.com/urfave/negroni"
)

func TestNewModelsRead(t *testing.T) {
	enforcer := casbin.NewEnforcer("../security/testdata/policy.conf", "../security/testdata/model.csv")
	type args struct {
		request *http.Request
	}

	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "Read",
			args: args{request: httptest.NewRequest("GET", "/api/v2/models", nil)},
			want: `[{"PType":"p","V0":"allow@security.test","V1":"/target","V2":"GET","V3":"allow","V4":"","V5":""},{"PType":"p","V0":"deny@security.test","V1":"/target","V2":"GET","V3":"deny","V4":"","V5":""}]`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			server := negroni.New(NewModelsRead(enforcer))
			recorder := httptest.NewRecorder()
			server.ServeHTTP(recorder, tt.args.request)

			out, err := ioutil.ReadAll(recorder.Result().Body)
			if err != nil {
				t.Errorf("NewModelsRead() failed with error: %v", err)
			}

			got := strings.TrimRight(string(out), "\n")
			if got != tt.want {
				t.Errorf("NewModelsRead() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestNewModelsWrite(t *testing.T) {
	type args struct {
		request  *http.Request
		user     string
		resource string
		action   string
	}
	tests := []struct {
		name      string
		args      args
		enforcer  *casbin.Enforcer
		want      int
		wantAllow bool
	}{
		{
			name: "Write",
			args: args{
				request:  httptest.NewRequest("PUT", "/api/v2/models", bytes.NewBufferString(`[{"PType":"p","V0":"allow1@security.test","V1":"/target","V2":"GET","V3":"allow","V4":"","V5":""}]`)),
				user:     "allow1@security.test",
				resource: "/target",
				action:   "GET",
			},
			enforcer:  casbin.NewEnforcer("../security/testdata/policy.conf", "../security/testdata/model.csv"),
			want:      200,
			wantAllow: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			server := negroni.New(NewModelsWrite(tt.enforcer))
			recorder := httptest.NewRecorder()
			server.ServeHTTP(recorder, tt.args.request)

			if got := recorder.Code; got != tt.want {
				t.Errorf("NewModelsWrite() = %v, want %v", got, tt.want)
			}

			if got := tt.enforcer.Enforce(tt.args.user, tt.args.resource, tt.args.action); got != tt.wantAllow {
				t.Errorf(".enforcer.Enforce(%v, %v, %v) = %v, wantAllow %v", tt.args.user, tt.args.resource, tt.args.action, got, tt.wantAllow)
			}
		})
	}
}

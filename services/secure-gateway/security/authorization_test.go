package security

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/casbin/casbin"
)

func noopHandler(rw http.ResponseWriter, r *http.Request) {}

type emptyAuditor struct{}

func (a *emptyAuditor) Allowed(subject, object, action string) {
}
func (a *emptyAuditor) Denied(subject, object, action string) {
}
func (a *emptyAuditor) EnforcerError(subject, object, action string, err error) {
}
func (a *emptyAuditor) TokenError(err error) {
}
func (a *emptyAuditor) RunningInTestMode() {
}
func (a *emptyAuditor) EnforcerEnabled() {
}
func (a *emptyAuditor) EnforcerDisabled() {
}

func TestAuthorizationMiddleware(t *testing.T) {
	enforcer := casbin.NewSyncedEnforcer("./testdata/policy.conf", "./testdata/model.csv")
	server := AuthorizationMiddleware(enforcer, &emptyAuditor{})
	type args struct {
		request *http.Request
	}
	tests := []struct {
		name string
		args args
		want int
	}{
		{
			name: "Allow",
			args: args{request: createRequest("GET", "/target", "allow@security.test")},
			want: http.StatusOK,
		},
		{
			name: "Deny",
			args: args{request: createRequest("GET", "/target", "deny@security.test")},
			want: http.StatusUnauthorized,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			next := noopHandler

			server.ServeHTTP(recorder, tt.args.request, next)
			if code := recorder.Result().StatusCode; code != tt.want {
				t.Errorf("AuthorizationMiddleware() = %v, want %v", code, tt.want)
			}
		})
	}
}

func createRequest(method, target, username string) *http.Request {
	info := &userInfo{
		email: username,
	}

	r := httptest.NewRequest(method, target, nil)
	ctx := context.WithValue(r.Context(), UserInfoKey, info)
	return r.WithContext(ctx)
}

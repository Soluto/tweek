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
	enforcer := casbin.NewSyncedEnforcer("./testdata/policy.conf", "./testdata/model2.csv")
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
			name: "Allow by user",
			args: args{request: createRequest("GET", "/values/key1", "alice@security.test")},
			want: http.StatusOK,
		},
		{
			name: "Deny by user",
			args: args{request: createRequest("GET", "/values/key1", "bob@security.test")},
			want: http.StatusUnauthorized,
		},
		{
			name: "Allow reading context for self",
			args: args{request: createRequest("GET", "/context/user/alice2@security.test", "alice2@security.test")},
			want: http.StatusOK,
		},
		{
			name: "Allow writing context for self",
			args: args{request: createRequest("POST", "/context/user/bob@security.test", "bob@security.test")},
			want: http.StatusOK,
		},
		{
			name: "Deny writing context for someone else",
			args: args{request: createRequest("POST", "/context/user/bob@security.test", "alice@security.test")},
			want: http.StatusUnauthorized,
		},
		{
			name: "Deny deleting context property for someone else",
			args: args{request: createRequest("DELETE", "/context/user/bob@security.test/prop", "alice@security.test")},
			want: http.StatusUnauthorized,
		},
		{
			name: "Deny deleting context property for self",
			args: args{request: createRequest("DELETE", "/context/user/bob@security.test/prop", "bob@security.test")},
			want: http.StatusOK,
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

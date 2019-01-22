package security

import (
	"context"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"testing"
)

func noopHandler(rw http.ResponseWriter, r *http.Request) {}

type emptyAuditor struct{}

func (a *emptyAuditor) Allowed(subject, object, action string) {
}
func (a *emptyAuditor) Denied(subject, object, action string) {
}
func (a *emptyAuditor) AuthorizerError(subject, object, action string, err error) {
}
func (a *emptyAuditor) TokenError(err error) {
}

func TestAuthorizationMiddleware(t *testing.T) {
	authorization, err := ioutil.ReadFile("../authorization.rego")
	if err != nil {
		t.Fatal("Could not load rego file")
	}
	policy, err := ioutil.ReadFile("./testdata/policy.json")
	if err != nil {
		t.Fatal("Could not load policy file")
	}
	authorizer := NewDefaultAuthorizer(string(authorization), string(policy), "authorization", "authorize")
	server := AuthorizationMiddleware(authorizer, &emptyAuditor{})
	type args struct {
		method, path, user, group string
	}
	tests := []struct {
		name string
		args args
		want int
	}{
		{
			name: "Allow by user",
			args: args{method: "GET", path: "/api/v2/values/key1", user: "alice@security.test", group: "default"},
			want: http.StatusOK,
		},
		{
			name: "Deny by user",
			args: args{method: "GET", path: "/api/v2/values/key1", user: "bob@security.test", group: "default"},
			want: http.StatusForbidden,
		},
		{
			name: "Allow calculating values with specific context",
			args: args{method: "GET", path: "/api/v2/values/key2?user=alice2@security.test", user: "alice2@security.test", group: "default"},
			want: http.StatusOK,
		},
		{
			name: "Allow reading context for self",
			args: args{method: "GET", path: "/api/v2/context/user/alice2@security.test", user: "alice2@security.test", group: "default"},
			want: http.StatusOK,
		},
		{
			name: "Allow writing context for self",
			args: args{method: "POST", path: "/api/v2/context/user/bob@security.test", user: "bob@security.test", group: "default"},
			want: http.StatusOK,
		},
		{
			name: "Deny writing context for someone else",
			args: args{method: "POST", path: "/api/v2/context/user/bob@security.test", user: "alice@security.test", group: "default"},
			want: http.StatusForbidden,
		},
		{
			name: "Deny deleting context property for someone else",
			args: args{method: "DELETE", path: "/api/v2/context/user/bob@security.test/prop", user: "alice@security.test", group: "default"},
			want: http.StatusForbidden,
		},
		{
			name: "Deny deleting context property for self",
			args: args{method: "DELETE", path: "/api/v2/context/user/bob@security.test/prop", user: "bob@security.test", group: "default"},
			want: http.StatusForbidden,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			next := noopHandler
			request := createRequest(tt.args.method, tt.args.path, tt.args.user, tt.args.group)

			server.ServeHTTP(recorder, request, next)
			if code := recorder.Result().StatusCode; code != tt.want {
				t.Errorf("AuthorizationMiddleware() = %v, want %v", code, tt.want)
			}
		})
	}
}

func createRequest(method, target, user, group string) *http.Request {
	info := &userInfo{
		sub: &Subject{User: user, Group: group},
	}

	r := httptest.NewRequest(method, target, nil)
	ctx := context.WithValue(r.Context(), UserInfoKey, info)
	return r.WithContext(ctx)
}

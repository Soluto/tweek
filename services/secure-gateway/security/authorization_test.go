package security

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAuthorizationMiddleware(t *testing.T) {
	mw := AuthorizationMiddleware("./testdata/policy.conf", "./testdata/model.csv")
	type args struct {
		request *http.Request
	}
	tests := []struct {
		name string
		args args
		want bool
	}{
		{
			name: "Allow",
			args: args{request: createRequest("GET", "/target", "allow@security.test")},
			want: true,
		},
		{
			name: "Deny",
			args: args{request: createRequest("GET", "/target", "deny@security.test")},
			want: false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			recorder := httptest.NewRecorder()
			got := false
			next := http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
				got = true
			})

			mw.ServeHTTP(recorder, tt.args.request, next)
			if got != tt.want {
				t.Errorf("AuthorizationMiddleware() = %v, want %v", got, tt.want)
			}
		})
	}
}

func createRequest(method, target, username string) *http.Request {
	info := &userInfo{
		email: username,
	}

	r := httptest.NewRequest(method, target, nil)
	ctx := context.WithValue(r.Context(), userInfoKey, info)
	return r.WithContext(ctx)
}

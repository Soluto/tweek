package security

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

func noopHandler(rw http.ResponseWriter, r *http.Request) {}

func TestAuthorizationMiddleware(t *testing.T) {
	mw := AuthorizationMiddleware("./testdata/policy.conf", "./testdata/model.csv")
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

			mw.ServeHTTP(recorder, tt.args.request, next)
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
	ctx := context.WithValue(r.Context(), userInfoKey, info)
	return r.WithContext(ctx)
}

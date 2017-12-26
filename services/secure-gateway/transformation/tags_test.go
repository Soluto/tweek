package transformation

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/Soluto/tweek/services/secure-gateway/security"
	jwt "github.com/dgrijalva/jwt-go" // jwt types

	"github.com/urfave/negroni"
)

func TestNewTagsGet(t *testing.T) {
	type args struct {
		upstream *url.URL
		request  *http.Request
		response http.ResponseWriter
	}
	tests := []struct {
		name string
		args args
		want string
	}{
		{
			name: "Get Tags",
			args: args{
				upstream: parseURL(t, "http://authoring/"),
				request:  httptest.NewRequest("GET", "http://tweek-authoring/api/v2/tags", nil),
				response: httptest.NewRecorder(),
			},
			want: "http://authoring/api/v1/tags",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var got string
			next := http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
				got = r.URL.String()
			})

			server := negroni.New(NewTagsGet(tt.args.upstream), negroni.WrapFunc(next))
			server.ServeHTTP(tt.args.response, tt.args.request)

			if got != tt.want {
				t.Errorf("NewTagsGet() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestNewTagsSave(t *testing.T) {
	tagsBody := makeTagsBody("tag1", "tag2")
	userInfo := makeUserInfo("John Doe", "john.doe@tweek.test")
	userInfo.Claims()
	type args struct {
		upstream *url.URL
		request  *http.Request
		response http.ResponseWriter
	}
	tests := []struct {
		name     string
		args     args
		wantURL  string
		wantBody string
	}{
		{
			name: "Get Tags",
			args: args{
				upstream: parseURL(t, "http://authoring/"),
				request:  makeRequestWithUserInfo("PUT", "http://tweek-authoring/api/v2/tags", tagsBody, makeUserInfo("name", "email")),
				response: httptest.NewRecorder(),
			},
			wantURL:  "http://authoring/api/v1/tags",
			wantBody: `["tag1","tag2"]`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			var gotURL string
			var gotBody string
			next := http.HandlerFunc(func(rw http.ResponseWriter, r *http.Request) {
				gotURL = r.URL.String()
				body, err := ioutil.ReadAll(r.Body)
				if err != nil {
					t.Errorf("Cannot read body %v", err)
				}
				gotBody = string(body)
			})

			server := negroni.New(NewTagsSave(tt.args.upstream), negroni.WrapFunc(next))
			// makeRequest
			server.ServeHTTP(tt.args.response, tt.args.request)

			if gotURL != tt.wantURL {
				t.Errorf("NewTagsSave() = %v, wantURL %v", gotURL, tt.wantURL)
			}

			if gotBody != tt.wantBody {
				t.Errorf("NewTagsSave() = %v, wantBody %v", gotBody, tt.wantBody)
			}
		})
	}
}

func makeTagsBody(tags ...string) io.Reader {
	result, err := json.Marshal(tags)
	if err != nil {
		panic(fmt.Errorf("Bad tags %v", tags))
	}

	return bytes.NewBuffer(result)
}

type testUserInfo struct {
	name  string
	email string
}

func (u *testUserInfo) Name() string {
	return u.name
}

func (u *testUserInfo) Email() string {
	return u.email
}

func (u *testUserInfo) Claims() jwt.StandardClaims {
	return jwt.StandardClaims{}
}

func makeUserInfo(name, email string) security.UserInfo {
	return &testUserInfo{name: name, email: email}
}

func makeRequestWithUserInfo(method, target string, body io.Reader, uinfo security.UserInfo) *http.Request {
	request := httptest.NewRequest(method, target, body)
	ctx := context.WithValue(request.Context(), security.UserInfoKey, makeUserInfo("name", "email"))
	return request.WithContext(ctx)
}

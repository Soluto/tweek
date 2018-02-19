package security

import (
	"context"
	"net/http"
	"net/http/httptest"
	"reflect"
	"testing"
)

func TestExtractFromRequest(t *testing.T) {
	type args struct {
		r *http.Request
	}

	userInfo := &userInfo{
		name:  "A B",
		email: "a@b.com",
	}

	tests := []struct {
		name    string
		args    args
		wantObj map[string]string
		wantSub string
		wantAct string
		wantErr error
	}{
		{
			name: "Write request",
			args: args{
				r: createTestRequest("POST", "https://gateway.tweek.com/keys", userInfo),
			},
			wantObj: map[string]string{"": "/keys"},
			wantSub: "a@b.com",
			wantAct: "write",
			wantErr: nil,
		},
		{
			name: "Read request",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/values", userInfo),
			},
			wantObj: map[string]string{"": "/values"},
			wantSub: "a@b.com",
			wantAct: "read",
			wantErr: nil,
		},
		{
			name: "Read request",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/revision-history", userInfo),
			},
			wantObj: map[string]string{"": "/revision-history"},
			wantSub: "a@b.com",
			wantAct: "history",
			wantErr: nil,
		},
		{
			name: "Read request",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/search-index", userInfo),
			},
			wantObj: map[string]string{"": "/search-index"},
			wantSub: "a@b.com",
			wantAct: "get search index",
			wantErr: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotSub, gotAct, gotObj, gotErr := ExtractFromRequest(tt.args.r)
			if !reflect.DeepEqual(gotObj, tt.wantObj) {
				t.Errorf("ExtractFromRequest() gotObj = %v, want %v", gotObj, tt.wantObj)
			}
			if gotSub != tt.wantSub {
				t.Errorf("ExtractFromRequest() gotSub = %v, want %v", gotSub, tt.wantSub)
			}
			if gotAct != tt.wantAct {
				t.Errorf("ExtractFromRequest() gotAct = %v, want %v", gotAct, tt.wantAct)
			}
			if gotErr != tt.wantErr {
				t.Errorf("ExtractFromRequest() gotErr = %v, want %v", gotErr, tt.wantErr)
			}
		})
	}
}

func createTestRequest(method string, url string, userInfo UserInfo) *http.Request {
	r := httptest.NewRequest(method, url, nil)
	rc := r.WithContext(context.WithValue(r.Context(), UserInfoKey, userInfo))
	return rc
}

func Test_extractContextsFromRequest(t *testing.T) {
	type args struct {
		r *http.Request
	}
	tests := []struct {
		name     string
		args     args
		wantCtxs map[string]string
		wantErr  bool
	}{
		{
			name: "Contexts for values request",
			args: args{
				r: createRequest("GET", "/values/key1?user=alice", "alice"),
			},
			wantCtxs: map[string]string{"": "/values/key1", "user": "self"},
			wantErr:  false,
		},
		{
			name: "Contexts for values request, with multiple contexts",
			args: args{
				r: createRequest("GET", "/values/key1?user=alice&device=1234", "alice"),
			},
			wantCtxs: map[string]string{"": "/values/key1", "user": "self", "device": "1234"},
			wantErr:  false,
		},
		{
			name: "Contexts for context read request (GET)",
			args: args{
				r: createRequest("GET", "/context/user/alice", "alice"),
			},
			wantCtxs: map[string]string{"user": "self"},
			wantErr:  false,
		},
		{
			name: "Contexts for context write request (POST)",
			args: args{
				r: createRequest("POST", "/context/user/alice", "alice"),
			},
			wantCtxs: map[string]string{"user": "self"},
			wantErr:  false,
		},
		{
			name: "Contexts for context write request (DELETE)",
			args: args{
				r: createRequest("POST", "/context/user/alice", "alice"),
			},
			wantCtxs: map[string]string{"user": "self"},
			wantErr:  false,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userInfo, _ := tt.args.r.Context().Value(UserInfoKey).(UserInfo)
			gotCtxs, err := extractContextsFromRequest(tt.args.r, userInfo)
			if (err != nil) != tt.wantErr {
				t.Errorf("extractContextsFromRequest() error = %v, wantErr %v", err, tt.wantErr)
				return
			}

			if !reflect.DeepEqual(gotCtxs, tt.wantCtxs) {
				t.Errorf("extractContextsFromRequest() = %v, want %v", gotCtxs, tt.wantCtxs)
			}
		})
	}
}

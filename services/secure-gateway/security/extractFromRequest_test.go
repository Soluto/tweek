package security

import (
	"context"
	"net/http"
	"net/http/httptest"
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
		wantObj string
		wantSub string
		wantAct string
		wantErr error
	}{
		{
			name: "Write request",
			args: args{
				r: createTestRequest("POST", "https://gateway.tweek.com/keys", userInfo),
			},
			wantObj: "/keys",
			wantSub: "a@b.com",
			wantAct: "write",
			wantErr: nil,
		},
		{
			name: "Read request",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/values", userInfo),
			},
			wantObj: "/values",
			wantSub: "a@b.com",
			wantAct: "read",
			wantErr: nil,
		},
		{
			name: "Read request",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/revision-history", userInfo),
			},
			wantObj: "/revision-history",
			wantSub: "a@b.com",
			wantAct: "history",
			wantErr: nil,
		},
		{
			name: "Read request",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/search-index", userInfo),
			},
			wantObj: "/search-index",
			wantSub: "a@b.com",
			wantAct: "get search index",
			wantErr: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotObj, gotSub, gotAct, gotErr := ExtractFromRequest(tt.args.r)
			if gotObj != tt.wantObj {
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

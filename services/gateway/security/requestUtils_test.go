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
		sub:   &Subject{User: "A b sub", Group: "default"},
	}

	tests := []struct {
		name    string
		args    args
		wantObj PolicyResource
		wantSub *Subject
		wantAct string
		wantErr error
	}{
		{
			name: "List keys request",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/api/v2/keys", userInfo),
			},
			wantObj: PolicyResource{Item: "repo", Contexts: map[string]string{}},
			wantSub: &Subject{User: "A b sub", Group: "default"},
			wantAct: "read",
			wantErr: nil,
		},
		{
			name: "Read some key request",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/api/v2/keys/some/key", userInfo),
			},
			wantObj: PolicyResource{Item: "repo", Contexts: map[string]string{}},
			wantSub: &Subject{User: "A b sub", Group: "default"},
			wantAct: "read",
			wantErr: nil,
		},
		{
			name: "Write request",
			args: args{
				r: createTestRequest("POST", "https://gateway.tweek.com/api/v2/keys/key1", userInfo),
			},
			wantObj: PolicyResource{Item: "repo/keys/key1", Contexts: map[string]string{}},
			wantSub: &Subject{User: "A b sub", Group: "default"},
			wantAct: "write",
			wantErr: nil,
		},
		{
			name: "Read request",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/api/v2/values/value1", userInfo),
			},
			wantObj: PolicyResource{Item: "values/value1", Contexts: map[string]string{}},
			wantSub: &Subject{User: "A b sub", Group: "default"},
			wantAct: "read",
			wantErr: nil,
		},
		{
			name: "History request",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/api/v2/revision-history", userInfo),
			},
			wantObj: PolicyResource{Item: "repo", Contexts: map[string]string{}},
			wantSub: &Subject{User: "A b sub", Group: "default"},
			wantAct: "read",
			wantErr: nil,
		},
		{
			name: "Get search index request",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/api/v2/search-index", userInfo),
			},
			wantObj: PolicyResource{Item: "repo", Contexts: map[string]string{}},
			wantSub: &Subject{User: "A b sub", Group: "default"},
			wantAct: "read",
			wantErr: nil,
		},
		{
			name: "Get search index request",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/api/v2/tags", userInfo),
			},
			wantObj: PolicyResource{Item: "repo", Contexts: map[string]string{}},
			wantSub: &Subject{User: "A b sub", Group: "default"},
			wantAct: "read",
			wantErr: nil,
		},
		{
			name: "Get context",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/api/v2/context/some_user/some_id", userInfo),
			},
			wantObj: PolicyResource{Item: "context/some_user/*", Contexts: map[string]string{"some_user": "some_id"}},
			wantSub: &Subject{User: "A b sub", Group: "default"},
			wantAct: "read",
			wantErr: nil,
		},
		{
			name: "Get apps",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/api/v2/apps", userInfo),
			},
			wantObj: PolicyResource{Item: "repo/apps", Contexts: map[string]string{}},
			wantSub: &Subject{User: "A b sub", Group: "default"},
			wantAct: "read",
			wantErr: nil,
		},
		{
			name: "Get Policies",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/api/v2/policies", userInfo),
			},
			wantObj: PolicyResource{Item: "repo/policies", Contexts: map[string]string{}},
			wantSub: &Subject{User: "A b sub", Group: "default"},
			wantAct: "read",
			wantErr: nil,
		},
		{
			name: "Get JWT extraction policy",
			args: args{
				r: createTestRequest("GET", "https://gateway.tweek.com/api/v2/jwt-extraction-policy", userInfo),
			},
			wantObj: PolicyResource{Item: "repo/policies", Contexts: map[string]string{}},
			wantSub: &Subject{User: "A b sub", Group: "default"},
			wantAct: "read",
			wantErr: nil,
		},
		{
			name: "Bulk keys upload",
			args: args{
				r: createTestRequest("PUT", "https://gateway.tweek.com/api/v2/bulk-keys-upload", userInfo),
			},
			wantObj: PolicyResource{Item: "repo/keys/_", Contexts: map[string]string{}},
			wantSub: &Subject{User: "A b sub", Group: "default"},
			wantAct: "write",
			wantErr: nil,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotSub, gotAct, gotObj, gotErr := ExtractFromRequest(tt.args.r)
			if !reflect.DeepEqual(gotObj, tt.wantObj) {
				t.Errorf("ExtractFromRequest() gotObj = %q, want %q", gotObj, tt.wantObj)
			}
			if *gotSub != *tt.wantSub {
				t.Errorf("ExtractFromRequest() gotSub = %q, want %q", gotSub, tt.wantSub)
			}
			if gotAct != tt.wantAct {
				t.Errorf("ExtractFromRequest() gotAct = %q, want %q", gotAct, tt.wantAct)
			}
			if gotErr != tt.wantErr {
				t.Errorf("ExtractFromRequest() gotErr = %q, want %q", gotErr, tt.wantErr)
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
		wantCtxs PolicyResource
		wantErr  bool
	}{
		{
			name: "Save schemas request",
			args: args{
				r: createRequest("POST", "/api/v2/schemas/device", "alice", "default"),
			},
			wantCtxs: PolicyResource{Item: "repo/schemas", Contexts: map[string]string{}},
			wantErr:  false,
		},
		{
			name: "Contexts for values request",
			args: args{
				r: createRequest("GET", "/api/v2/values/key1?user=alice", "alice", "default"),
			},
			wantCtxs: PolicyResource{Item: "values/key1", Contexts: map[string]string{"user": "self"}},
			wantErr:  false,
		},
		{
			name: "Contexts for values request, with multiple contexts",
			args: args{
				r: createRequest("GET", "/api/v2/values/key1?user=alice&device=1234", "alice", "default"),
			},
			wantCtxs: PolicyResource{Item: "values/key1", Contexts: map[string]string{"user": "self", "device": "1234"}},
			wantErr:  false,
		},
		{
			name: "Contexts for context read request (GET)",
			args: args{
				r: createRequest("GET", "/api/v2/context/user/alice", "alice", "default"),
			},
			wantCtxs: PolicyResource{Contexts: map[string]string{"user": "self"}, Item: "context/user/*"},
			wantErr:  false,
		},
		{
			name: "Contexts for context write request (POST)",
			args: args{
				r: createRequest("POST", "/api/v2/context/user/alice", "alice", "default"),
			},
			wantCtxs: PolicyResource{Contexts: map[string]string{"user": "self"}, Item: "context/user/*"},
			wantErr:  false,
		},
		{
			name: "Contexts for context write request (DELETE)",
			args: args{
				r: createRequest("DELETE", "/api/v2/context/user/alice/property", "alice", "default"),
			},
			wantCtxs: PolicyResource{Contexts: map[string]string{"user": "self"}, Item: "context/user/property"},
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

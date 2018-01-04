package security

import "net/http"
import "strings"

// ExtractFromRequest extracts object and action from request
func ExtractFromRequest(r *http.Request) (obj string, sub string, act string, err string) {
	user, ok := r.Context().Value(UserInfoKey).(UserInfo)
	if !ok {
		err = "Authentication failed"
	} else {

		// this is work in progress
		sub = user.Email()
		switch {
		case r.Method == "DELETE":
		case r.Method == "PUT":
		case r.Method == "POST":
		case r.Method == "PATCH":
			act = "write"
		case r.Method == "GET" && strings.HasPrefix(r.RequestURI, "/manifests"):
		case r.Method == "GET" && strings.HasPrefix(r.RequestURI, "/keys"):
			act = "list"
		case r.Method == "GET" && strings.HasPrefix(r.RequestURI, "/search"):
		case r.Method == "GET" && strings.HasPrefix(r.RequestURI, "/suggestions"):
			act = "search"
		case r.Method == "GET" && strings.HasPrefix(r.RequestURI, "/search-index"):
			act = "get search index"
		case r.Method == "GET" && strings.HasPrefix(r.RequestURI, "/revision-history"):
			act = "history"
		default:
			act = "read"
		}
		obj = r.RequestURI
	}
	return obj, sub, act, err
}

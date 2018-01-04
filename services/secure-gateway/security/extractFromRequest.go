package security

import (
	"errors"
	"net/http"
	"net/url"
	"strings"
)

// ExtractFromRequest extracts object and action from request
func ExtractFromRequest(r *http.Request) (obj string, sub string, act string, err error) {
	user, ok := r.Context().Value(UserInfoKey).(UserInfo)
	if !ok {
		err = errors.New("Authentication failed")
	} else {
		uri, err1 := url.Parse(r.RequestURI)
		if err != nil {
			return "", "", "", err1
		}

		// this is work in progress
		sub = user.Email()
		switch {
		case r.Method == "DELETE":
			fallthrough
		case r.Method == "PUT":
			fallthrough
		case r.Method == "POST":
			fallthrough
		case r.Method == "PATCH":
			act = "write"
			break
		case r.Method == "GET" && strings.HasPrefix(uri.Path, "/manifests"):
			fallthrough
		case r.Method == "GET" && strings.HasPrefix(uri.Path, "/keys"):
			act = "list"
			break
		case r.Method == "GET" && strings.HasPrefix(uri.Path, "/search-index"):
			act = "get search index"
			break
		case r.Method == "GET" && strings.HasPrefix(uri.Path, "/search"):
			fallthrough
		case r.Method == "GET" && strings.HasPrefix(uri.Path, "/suggestions"):
			act = "search"
			break
		case r.Method == "GET" && strings.HasPrefix(uri.Path, "/revision-history"):
			act = "history"
			break
		default:
			act = "read"
			break
		}
		obj = uri.Path
	}
	return obj, sub, act, err
}

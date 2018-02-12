package security

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

func extractActionFromRequest(r *http.Request) (act string, err error) {
	uri, err := url.Parse(r.RequestURI)
	if err != nil {
		return
	}

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
	return
}

func extractContextsFromValuesRequest(r *http.Request) (ctxs []string, err error) {
	uri, err := url.Parse(r.RequestURI)
	if err != nil {
		return
	}

	user, ok := r.Context().Value(UserInfoKey).(UserInfo)
	if strings.HasPrefix(uri.Path, "/values") {
		ctxs = []string{}
		for key, value := range uri.Query() {
			// checking for special chars - these are not context identity names
			if !strings.ContainsAny(key, "$.") {
				identityID := url.PathEscape(value[0])
				if ok && (user.Email() == identityID || user.Name() == identityID) {
					identityID = "self"
				}
				ctxs = append(ctxs, fmt.Sprintf("%v=%v", url.PathEscape(key), identityID))
			}
		}
	}

	return
}

const (
	contextIdentityType = iota + 1
	contextIdentityID
	contextProp
)

func extractContextFromContextRequest(r *http.Request) (ctx string, err error) {
	path := r.URL.EscapedPath()
	if !strings.HasPrefix(path, "/context") {
		err = fmt.Errorf("ExtractContextFromContextRequest: expected context request, but got %v", path)
		return
	}

	segments := strings.Split(path, "/")[1:] // skip the first entry, because it's empty
	identityType, identityID := segments[contextIdentityType], segments[contextIdentityID]
	method := strings.ToUpper(r.Method)
	user, ok := r.Context().Value(UserInfoKey).(UserInfo)
	escapedEmail, escapedName := url.PathEscape(user.Email()), url.PathEscape(user.Name())
	if ok && (escapedEmail == identityID || escapedName == identityID) {
		identityID = "self"
	}
	switch method {
	case "DELETE":
		if len(segments) <= contextProp {
			err = fmt.Errorf("ExtractContextFromContextRequest: missing property for context request")
			return
		}
		prop := segments[contextProp]
		ctx = fmt.Sprintf("%v=%v:%v", identityType, identityID, prop)
	case "GET", "POST":
		ctx = fmt.Sprintf("%v=%v", identityType, identityID)
	default:
		err = fmt.Errorf("ExtractContextFromContextRequest: unexptected method %v", method)
	}

	return
}

func extractContextsFromRequest(r *http.Request) (ctxs []string, err error) {
	path := r.URL.EscapedPath()
	if strings.HasPrefix(path, "/context") {
		ctx, err := extractContextFromContextRequest(r)
		return []string{ctx}, err
	} else if strings.HasPrefix(path, "/values") {
		return extractContextsFromValuesRequest(r)
	}

	return nil, fmt.Errorf("Expected values request or context request, but got %v", r.RequestURI)
}

// ExtractFromRequest extracts object and action from request
func ExtractFromRequest(r *http.Request) (obj string, sub string, act string, ctxs []string, err error) {
	user, ok := r.Context().Value(UserInfoKey).(UserInfo)
	if !ok {
		err = errors.New("Authentication failed")
	} else {
		uri, err1 := url.Parse(r.RequestURI)
		if err != nil {
			return "", "", "", []string{}, err1
		}

		sub = user.Email()
		obj = uri.Path
		act, err = extractActionFromRequest(r)
		if err != nil {
			return
		}
		ctxs, err = extractContextsFromRequest(r)
		if err != nil && ctxs != nil && len(ctxs) != 0 {
			return
		}

		err = nil
	}

	return obj, sub, act, ctxs, err
}

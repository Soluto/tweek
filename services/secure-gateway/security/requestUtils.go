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

const (
	contextIdentityType = iota + 1
	contextIdentityID
	contextProp
)

func extractContextsFromValuesRequest(r *http.Request, u UserInfo) (ctxs map[string]string, err error) {
	uri := r.URL

	ctxs = make(map[string]string)
	ctxs[""] = uri.EscapedPath()
	for key, value := range uri.Query() {
		// checking for special chars - these are not context identity names
		if !strings.ContainsAny(key, "$.") {
			identityID := normalizeIdentityID(url.PathEscape(value[0]), u)
			ctxs[url.PathEscape(key)] = identityID
		}
	}

	return
}

func extractContextFromContextRequest(r *http.Request, u UserInfo) (ctx map[string]string, err error) {
	ctx = make(map[string]string)
	path := r.URL.EscapedPath()
	if !strings.HasPrefix(path, "/context") {
		err = fmt.Errorf("ExtractContextFromContextRequest: expected context request, but got %v", path)
		return
	}

	segments := strings.Split(path, "/")[1:] // skip the first entry, because it's empty
	identityType, identityID := segments[contextIdentityType], segments[contextIdentityID]
	identityID = normalizeIdentityID(identityID, u)
	method := strings.ToUpper(r.Method)

	switch method {
	case "DELETE":
		if len(segments) <= contextProp {
			err = fmt.Errorf("ExtractContextFromContextRequest: missing property for context request")
			return
		}
		prop := segments[contextProp]
		ctx[""] = prop
		ctx[identityType] = identityID
	case "GET", "POST":
		ctx[identityType] = identityID
	default:
		err = fmt.Errorf("ExtractContextFromContextRequest: unexptected method %v", method)
	}

	return
}

func normalizeIdentityID(id string, u UserInfo) string {
	identityID := id
	escapedEmail, escapedName := url.PathEscape(u.Email()), url.PathEscape(u.Name())
	if escapedEmail == identityID || escapedName == identityID {
		identityID = "self"
	}

	return identityID
}

func extractContextsFromOtherRequest(r *http.Request, u UserInfo) (ctxs map[string]string, err error) {
	ctxs = make(map[string]string)
	ctxs[""] = r.URL.EscapedPath()

	return
}

func extractContextsFromRequest(r *http.Request, u UserInfo) (ctxs map[string]string, err error) {
	path := r.URL.EscapedPath()
	if strings.HasPrefix(path, "/context") {
		return extractContextFromContextRequest(r, u)
	} else if strings.HasPrefix(path, "/values") {
		return extractContextsFromValuesRequest(r, u)
	} else {
		return extractContextsFromOtherRequest(r, u)
	}
}

// ExtractFromRequest extracts object and action from request
func ExtractFromRequest(r *http.Request) (sub string, act string, obj map[string]string, err error) {
	user, ok := r.Context().Value(UserInfoKey).(UserInfo)
	if !ok {
		err = errors.New("Missing user information in request")
		return
	}

	sub = user.Email()
	act, err = extractActionFromRequest(r)
	if err != nil {
		return "", "", map[string]string{}, err
	}

	obj, err = extractContextsFromRequest(r, user)
	if err != nil {
		return "", "", map[string]string{}, err
	}

	err = nil
	return sub, act, obj, err
}

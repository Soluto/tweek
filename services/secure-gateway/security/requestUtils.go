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
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/values"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/keys"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/manifests"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/search-index"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/search"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/suggestions"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/dependents"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/schemas"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/tags"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/revision-history"):
		act = "read"
		break
	default:
		act = "invalid"
		break
	}
	return
}

const (
	contextIdentityType = iota
	contextIdentityID
	contextProp
)

// KeyOrProperty is the name of the key in the map, which holds either key or property
const KeyOrProperty = ""

func extractContextsFromValuesRequest(r *http.Request, u UserInfo) (ctxs PolicyResource, err error) {
	uri := r.URL

	ctxs = PolicyResource{Contexts: map[string]string{}}
	ctxs.Item = strings.Replace(uri.EscapedPath(), "/api/v2/values/", "keys.", 1)
	for key, value := range uri.Query() {
		// checking for special chars - these are not context identity names
		if !strings.ContainsAny(key, "$.") {
			identityID := normalizeIdentityID(url.PathEscape(value[0]), u)
			ctxs.Contexts[url.PathEscape(key)] = identityID
		}
	}

	return
}

func extractContextsFromKeysRequest(r *http.Request, u UserInfo) (ctxs PolicyResource, err error) {
	uri := r.URL

	ctxs = PolicyResource{Contexts: map[string]string{}}
	if r.Method == "GET" {
		ctxs.Item = "repo"
		return
	}
	ctxs.Item = strings.Replace(uri.EscapedPath(), "/api/v2/keys/", "repo.keys/", 1)

	return
}

func extractContextFromContextRequest(r *http.Request, u UserInfo) (ctx PolicyResource, err error) {
	ctx = PolicyResource{Contexts: map[string]string{}}
	path := r.URL.EscapedPath()

	segments := strings.Split(strings.Replace(path, "/api/v2/context/", "", 1), "/")
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
		ctx.Item = fmt.Sprintf("%v.%v", identityType, prop)
		ctx.Contexts[identityType] = identityID
	case "GET", "POST":
		ctx.Contexts[identityType] = identityID
		ctx.Item = fmt.Sprintf("%v.*", identityType)
	default:
		err = fmt.Errorf("ExtractContextFromContextRequest: unexptected method %v", method)
	}

	return
}

func normalizeIdentityID(id string, u UserInfo) string {
	identityID := id
	escapedEmail, escapedName, escapedSub := url.PathEscape(u.Email()), url.PathEscape(u.Name()), url.PathEscape(u.Sub())
	if escapedEmail == identityID || escapedName == identityID || escapedSub == identityID {
		identityID = "self"
	}

	return identityID
}

func extractContextsFromOtherRequest(r *http.Request, u UserInfo) (ctxs PolicyResource, err error) {
	ctxs = PolicyResource{Contexts: map[string]string{}}
	ctxs.Item = "repo"

	return
}

func extractContextsFromRequest(r *http.Request, u UserInfo) (ctxs PolicyResource, err error) {
	path := r.URL.EscapedPath()
	if strings.HasPrefix(path, "/api/v2/context") {
		return extractContextFromContextRequest(r, u)
	} else if strings.HasPrefix(path, "/api/v2/values") {
		return extractContextsFromValuesRequest(r, u)
	} else if strings.HasPrefix(path, "/api/v2/keys") {
		return extractContextsFromKeysRequest(r, u)
	} else if strings.HasPrefix(path, "/api/v2/manifests") {
		return extractContextsFromOtherRequest(r, u)
	} else if strings.HasPrefix(path, "/api/v2/suggestions") {
		return extractContextsFromOtherRequest(r, u)
	} else if strings.HasPrefix(path, "/api/v2/dependents") {
		return extractContextsFromOtherRequest(r, u)
	} else if strings.HasPrefix(path, "/api/v2/search") {
		return extractContextsFromOtherRequest(r, u)
	} else if strings.HasPrefix(path, "/api/v2/search-index") {
		return extractContextsFromOtherRequest(r, u)
	} else if strings.HasPrefix(path, "/api/v2/tags") {
		return extractContextsFromOtherRequest(r, u)
	} else if strings.HasPrefix(path, "/api/v2/revision-history") {
		return extractContextsFromOtherRequest(r, u)
	} else if strings.HasPrefix(path, "/api/v2/schemas") {
		return extractContextsFromOtherRequest(r, u)
	}
	err = fmt.Errorf("Invalid request path %s", path)
	return
}

// ExtractFromRequest extracts object and action from request
func ExtractFromRequest(r *http.Request) (sub string, act string, obj PolicyResource, err error) {
	user, ok := r.Context().Value(UserInfoKey).(UserInfo)
	if !ok {
		err = errors.New("Missing user information in request")
		return
	}

	sub = user.Sub()
	act, err = extractActionFromRequest(r)
	if err != nil {
		return "", "", PolicyResource{Contexts: map[string]string{}}, err
	}

	obj, err = extractContextsFromRequest(r, user)
	if err != nil {
		return "", "", PolicyResource{Contexts: map[string]string{}}, err
	}

	err = nil
	return sub, act, obj, err
}

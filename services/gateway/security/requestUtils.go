package security

import (
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

// PolicyResource describes policy resource with item and associated tweek contexts
type PolicyResource struct {
	Item     string
	Contexts map[string]string
}

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
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/hooks"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/revision-history"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/policies"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/resource/policies"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/jwt-extraction-policy"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/context"):
		fallthrough
	case r.Method == "GET" && strings.HasPrefix(uri.Path, "/api/v2/apps"):
		act = "read"
		break
	default:
		err = fmt.Errorf("Invalid action method: %v %v", r.Method, uri.Path)
		break
	}
	return
}

const (
	contextIdentityType = iota
	contextIdentityID
	contextProp
)

func extractContextsFromValuesRequest(r *http.Request, u UserInfo) (ctxs PolicyResource, err error) {
	uri := r.URL

	ctxs = PolicyResource{Contexts: map[string]string{}}
	ctxs.Item = strings.Replace(uri.EscapedPath(), "/api/v2/values/", "values/", 1)
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
	ctxs.Item = strings.Replace(uri.EscapedPath(), "/api/v2/keys/", "repo/keys/", 1)

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
		var prop string
		if len(segments) <= contextProp {
			prop = "*"
		} else {
			prop = segments[contextProp]
		}
		ctx.Item = fmt.Sprintf("context/%v/%v", identityType, prop)
		ctx.Contexts[identityType] = identityID
	case "GET", "POST":
		ctx.Contexts[identityType] = identityID
		ctx.Item = fmt.Sprintf("context/%v/*", identityType)
	default:
		err = fmt.Errorf("ExtractContextFromContextRequest: unexpected method %v", method)
	}

	return
}

func normalizeIdentityID(id string, u UserInfo) string {
	identityID := id
	escapedUser := url.PathEscape(u.Sub().User)

	if escapedUser == identityID {
		identityID = "self"
	}

	return identityID
}

func extractResourceFromRepoRequest(r *http.Request, u UserInfo, kind string) (ctxs PolicyResource, err error) {
	ctxs = PolicyResource{Contexts: map[string]string{}}
	switch {
	case r.Method == "GET":
		ctxs.Item = "repo"
		break
	case r.Method == "POST":
		fallthrough
	case r.Method == "PUT":
		fallthrough
	case r.Method == "PATCH":
		fallthrough
	case r.Method == "DELETE":
		ctxs.Item = "repo/" + kind
		break
	default:
		err = fmt.Errorf("Invalid method %s for %s", r.Method, kind)
	}
	return
}

func extractContextsFromRequest(r *http.Request, u UserInfo) (ctxs PolicyResource, err error) {
	path := r.URL.EscapedPath()
	switch {
	case strings.HasPrefix(path, "/api/v2/manifests"):
		fallthrough
	case strings.HasPrefix(path, "/api/v2/suggestions"):
		fallthrough
	case strings.HasPrefix(path, "/api/v2/dependents"):
		fallthrough
	case strings.HasPrefix(path, "/api/v2/search"):
		fallthrough
	case strings.HasPrefix(path, "/api/v2/revision-history"):
		fallthrough
	case strings.HasPrefix(path, "/api/v2/search-index"):
		ctxs = PolicyResource{Item: "repo", Contexts: map[string]string{}}
		return
	case strings.HasPrefix(path, "/api/v2/apps"):
		ctxs = PolicyResource{Item: "repo/apps", Contexts: map[string]string{}}
		return
	case strings.HasPrefix(path, "/api/v2/policies"):
		fallthrough
	case strings.HasPrefix(path, "/api/v2/resource/policies"):
		fallthrough
	case strings.HasPrefix(path, "/api/v2/jwt-extraction-policy"):
		ctxs = PolicyResource{Item: "repo/policies", Contexts: map[string]string{}}
		return
	case strings.HasPrefix(path, "/api/v2/bulk-keys-upload"):
		ctxs = PolicyResource{Item: "repo/keys/_", Contexts: map[string]string{}}
		return
	case strings.HasPrefix(path, "/api/v2/context"):
		return extractContextFromContextRequest(r, u)
	case strings.HasPrefix(path, "/api/v2/values"):
		return extractContextsFromValuesRequest(r, u)
	case strings.HasPrefix(path, "/api/v2/keys"):
		return extractContextsFromKeysRequest(r, u)
	case strings.HasPrefix(path, "/api/v2/tags"):
		return extractResourceFromRepoRequest(r, u, "tags")
	case strings.HasPrefix(path, "/api/v2/schemas"):
		return extractResourceFromRepoRequest(r, u, "schemas")
	case strings.HasPrefix(path, "/api/v2/hooks"):
		return extractResourceFromRepoRequest(r, u, "hooks")
	}

	err = fmt.Errorf("Invalid request path %s", path)
	return
}

// ExtractFromRequest extracts object and action from request
func ExtractFromRequest(r *http.Request) (sub *Subject, act string, obj PolicyResource, err error) {
	user, ok := r.Context().Value(UserInfoKey).(UserInfo)
	if !ok {
		err = errors.New("Missing user information in request")
		return
	}

	sub = user.Sub()
	act, err = extractActionFromRequest(r)
	if err != nil {
		fullErr := fmt.Errorf("Couldn't extract action from request: %v", err)
		return &Subject{}, "", PolicyResource{Contexts: map[string]string{}}, fullErr
	}

	obj, err = extractContextsFromRequest(r, user)
	if err != nil {
		fullErr := fmt.Errorf("Couldn't extract action from request: %v", err)
		return &Subject{}, "", PolicyResource{Contexts: map[string]string{}}, fullErr
	}

	err = nil
	return sub, act, obj, err
}

package transformation

import (
	"log"
	"net/http"
	"net/url"

	"github.com/Soluto/tweek/services/secure-gateway/security"

	"github.com/urfave/negroni"
)

// NewTagsGet creates tags transformation middleware to get all the tags
// upstream is the upstream URL, where the request should be redirected
func NewTagsGet(upstream *url.URL) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		newURL := getTagsURLForUpstream(upstream)
		r.URL = newURL
		next(rw, r)
	}
}

// NewTagsSave creates tags transformation middleware to save the tags in tweek
// upstream is the upstream URL, where the request should be redirected
func NewTagsSave(upstream *url.URL) negroni.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		newURL := getTagsURLForUpstream(upstream)
		userInfo, ok := r.Context().Value(security.UserInfoKey).(security.UserInfo)
		if !ok {
			panic("User info missing")
		}

		newURL.Query().Set("author.name", userInfo.Name())
		newURL.Query().Set("author.email", userInfo.Email())
		r.URL = newURL

		next(rw, r)
	}
}

func getTagsURLForUpstream(upstream *url.URL) *url.URL {
	newURL, err := url.Parse(upstream.String() + "api/v1/tags")
	if err != nil {
		log.Panicln("Failed converting tags URL", err)
	}

	return newURL
}

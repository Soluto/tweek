package security

import "net/http"

// ExtractFromRequest extracts object and action from request
func ExtractFromRequest(r *http.Request) (obj string, sub string, act string, err string) {
	user, ok := r.Context().Value(UserInfoKey).(UserInfo)
	if !ok {
		err = "Authentication failed"
	} else {

		// this is work in progress
		sub = user.Email()
		obj = r.RequestURI
		act = r.Method
	}
	return obj, sub, act, err
}

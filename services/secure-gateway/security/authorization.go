package security

import (
	"log"
	"net/http"

	"github.com/casbin/casbin"

	"github.com/urfave/negroni"
)

// AuthorizationMiddleware enforces authorization policies of incoming requests
func AuthorizationMiddleware(enforcer *casbin.SyncedEnforcer) negroni.HandlerFunc {
	return negroni.HandlerFunc(func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		user, ok := r.Context().Value(UserInfoKey).(UserInfo)
		if !ok {
			http.Error(rw, "Unauthorized", http.StatusUnauthorized)
			return
		}

		// this is work in progress
		subject := user.Email()
		object := r.RequestURI
		action := r.Method

		result, err := enforcer.EnforceSafe(subject, object, action)
		if err != nil {
			log.Println("Failed to validate request", err)
		}

		if result {
			next(rw, r)
		} else {
			http.Error(rw, "Access denied", http.StatusUnauthorized)
		}
	})
}

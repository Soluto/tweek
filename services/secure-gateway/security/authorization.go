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

		obj, sub, act, err := ExtractFromRequest(r)
		if err != nil {
			log.Println("Failed to extract from request", err)
			http.Error(rw, "Bad request", http.StatusBadRequest)
		} else {
			result, err := enforcer.EnforceSafe(sub, obj, act)
			if err != nil {
				log.Println("Failed to validate request", err)
			}

			if result {
				next(rw, r)
			} else {
				http.Error(rw, "Access denied", http.StatusUnauthorized)
			}
		}
	})
}

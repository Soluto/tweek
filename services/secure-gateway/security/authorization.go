package security

import (
	"log"
	"net/http"

	"github.com/Soluto/tweek/services/secure-gateway/audit"

	"github.com/casbin/casbin"

	"github.com/urfave/negroni"
)

// AuthorizationMiddleware enforces authorization policies of incoming requests
func AuthorizationMiddleware(enforcer *casbin.SyncedEnforcer, auditor audit.Auditor) negroni.HandlerFunc {
	return negroni.HandlerFunc(func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		obj, sub, act, err := ExtractFromRequest(r)
		if err != nil {
			log.Println("Failed to extract from request", err)
			auditor.EnforcerError(sub, obj, act, err)
			http.Error(rw, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		} else {
			result, err := enforcer.EnforceSafe(sub, obj, act)
			if err != nil {
				log.Println("Failed to validate request", err)
				auditor.EnforcerError(sub, obj, act, err)
			}

			if result {
				auditor.Allowed(sub, obj, act)
				next(rw, r)
			} else {
				auditor.Denied(sub, obj, act)
				http.Error(rw, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			}
		}
	})
}

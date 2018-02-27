package security

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Soluto/tweek/services/secure-gateway/audit"

	"github.com/casbin/casbin"

	"github.com/urfave/negroni"
)

// AuthorizationMiddleware enforces authorization policies of incoming requests
func AuthorizationMiddleware(enforcer *casbin.SyncedEnforcer, auditor audit.Auditor) negroni.HandlerFunc {
	enforcer.AddFunction("matchResources", MatchResources)
	return negroni.HandlerFunc(func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		sub, act, ctxs, err := ExtractFromRequest(r)
		if err != nil {
			log.Println("Failed to extract from request", err)
			auditor.EnforcerError(sub, fmt.Sprintf("%q", ctxs), act, err)
			http.Error(rw, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		} else {
			res, err := enforcer.EnforceSafe(sub, ctxs, act)
			if err != nil {
				log.Println("Failed to validate request", err)
				auditor.EnforcerError(sub, fmt.Sprintf("%q", ctxs), act, err)
				http.Error(rw, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
				return
			}

			if !res {
				auditor.Denied(sub, fmt.Sprintf("%q", ctxs), act)
				http.Error(rw, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
				return
			}

			auditor.Allowed(sub, fmt.Sprintf("%q", ctxs), act)
			next(rw, r)
		}
	})
}

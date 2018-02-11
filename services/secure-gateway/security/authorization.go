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
	return negroni.HandlerFunc(func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		obj, sub, act, ctxs, err := ExtractFromRequest(r)
		if err != nil {
			log.Println("Failed to extract from request", err)
			auditor.EnforcerError(sub, obj, act, err)
			http.Error(rw, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		} else {
			objects := []string{obj}
			for _, ctx := range ctxs {
				objects = append(objects, fmt.Sprintf("%v:%v", ctx, obj))
			}

			for _, obj := range objects {
				res, err := enforcer.EnforceSafe(sub, obj, act)
				if err != nil {
					log.Println("Failed to validate request", err)
					auditor.EnforcerError(sub, obj, act, err)
					http.Error(rw, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
					return
				}

				if !res {
					auditor.Denied(sub, obj, act)
					http.Error(rw, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
					return
				}
			}

			auditor.Allowed(sub, obj, act)
			next(rw, r)
		}
	})
}

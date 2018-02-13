package security

import (
	"fmt"
	"log"
	"net/http"
	"strings"

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
			objects := formatObjects(obj, ctxs)

			for _, object := range objects {
				res, err := enforcer.EnforceSafe(sub, object, act)
				if err != nil {
					log.Println("Failed to validate request", err)
					auditor.EnforcerError(sub, object, act, err)
					http.Error(rw, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
					return
				}

				if !res {
					auditor.Denied(sub, object, act)
					http.Error(rw, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
					return
				}
			}

			auditor.Allowed(sub, obj, act)
			next(rw, r)
		}
	})
}

func formatObjects(fromRequest string, other []string) []string {
	objects := []string{}
	if len(other) != 0 {
		for _, ctx := range other {
			if strings.ContainsAny(ctx, ":") {
				objects = append(objects, ctx)
			} else {
				objects = append(objects, fmt.Sprintf("%v:%v", ctx, fromRequest))
			}
		}
	} else {
		objects = append(objects, fromRequest)
	}

	return objects
}

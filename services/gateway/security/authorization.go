package security

import (
	"fmt"
	"log"
	"net/http"

	"github.com/Soluto/tweek/services/gateway/audit"

	"github.com/urfave/negroni"
)

// AuthorizationMiddleware enforces authorization policies of incoming requests
func AuthorizationMiddleware(authorizer Authorizer, auditor audit.Auditor) negroni.HandlerFunc {
	return negroni.HandlerFunc(func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		user, ok := r.Context().Value(UserInfoKey).(UserInfo)
		if !ok {
			log.Panic("Authentication failed")
		}
		if user.Issuer() == "tweek" {
			next(rw, r)
			log.Print("Issuer is tweek - ACCESS ALLOWED")
		} else {
			sub, act, ctxs, err := ExtractFromRequest(r)
			if err != nil {
				log.Println("Failed to extract from request", err)
				auditor.AuthorizerError(sub.String(), fmt.Sprintf("%q", ctxs), act, err)
				http.Error(rw, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
			} else {
				res, err := authorizer.Authorize(sub.String(), ctxs, act, r.Context())
				if err != nil {
					log.Println("Failed to validate request", err)
					auditor.AuthorizerError(sub.String(), fmt.Sprintf("%q", ctxs), act, err)
					http.Error(rw, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
					return
				}

				if !res {
					auditor.Denied(sub.String(), fmt.Sprintf("%q", ctxs), act)
					http.Error(rw, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
					return
				}

				auditor.Allowed(sub.String(), fmt.Sprintf("%q", ctxs), act)
				next(rw, r)
			}
		}
	})
}

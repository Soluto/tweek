package security

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/sirupsen/logrus"

	"github.com/Soluto/tweek/services/gateway/audit"

	"github.com/urfave/negroni"
)

// AuthorizationMiddleware enforces authorization policies of incoming requests
func AuthorizationMiddleware(authorizer Authorizer, auditor audit.Auditor) negroni.HandlerFunc {
	return negroni.HandlerFunc(func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		user, ok := r.Context().Value(UserInfoKey).(UserInfo)
		if !ok {
			logrus.Error("Authentication failed")
			auditor.TokenError(errors.New("Authentication failed"))
			http.Error(rw, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			return
		}
		if user.Issuer() == "tweek" {
			next(rw, r)
			auditor.Allowed("tweek issuer", "any", "any")
		} else {
			sub, act, ctxs, err := ExtractFromRequest(r)
			if err != nil {
				logrus.WithError(err).Error("Failed to extract from request")
				auditor.AuthorizerError(sub.String(), fmt.Sprintf("%q", ctxs), act, err)
				http.Error(rw, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
			} else {
				res, err := authorizer.Authorize(r.Context(), sub, ctxs, act)
				if err != nil {
					logrus.WithError(err).Error("Failed to validate request")
					auditor.AuthorizerError(sub.String(), fmt.Sprintf("%q", ctxs), act, err)
					http.Error(rw, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
					return
				}

				if !res {
					auditor.Denied(sub.String(), fmt.Sprintf("%q", ctxs), act)
					http.Error(rw, http.StatusText(http.StatusForbidden), http.StatusForbidden)
					return
				}

				auditor.Allowed(sub.String(), fmt.Sprintf("%q", ctxs), act)
				next(rw, r)
			}
		}
	})
}

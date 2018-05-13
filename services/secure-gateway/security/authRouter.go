package security

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
	"github.com/Soluto/tweek/services/secure-gateway/externalApps"
	jwt "github.com/dgrijalva/jwt-go"
	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
)

// MountAuth -
func MountAuth(providers map[string]appConfig.AuthProvider, keyEnv *appConfig.EnvInlineOrPath, middleware *negroni.Negroni, router *mux.Router) {
	router.Methods("OPTIONS").Handler(middleware)

	router.Methods("GET").Path("/providers").Handler(middleware.With(getAuthProviders(providers)))
	router.Methods("GET").Path("/basic").Handler(middleware.With(authorizeByUserPassword(keyEnv)))
}

func getAuthProviders(providers map[string]appConfig.AuthProvider) negroni.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		js, err := json.Marshal(providers)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Write(js)
	}
}

func authorizeByUserPassword(keyEnv *appConfig.EnvInlineOrPath) negroni.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		if username, password, ok := r.BasicAuth(); ok {
			isValid, err := externalApps.ValidateCredentials(username, password)
			if err != nil {
				log.Panicln("Credentials validation failed", err)
			}
			if !isValid {
				http.Error(w, "Invalid credentials provided", http.StatusUnauthorized)
				return
			}

			key, err := getPrivateKey(keyEnv)
			if err != nil {
				log.Panicln("Private key retrieving failed:", err)
			}
			requestQuery := r.URL.Query()
			redirectURL := requestQuery.Get("redirect_url")
			state := requestQuery.Get("state")
			email := requestQuery.Get("email")
			token := createBasicAuthJWT(username, email, key)
			url := fmt.Sprintf("%s?jwt=%s&state=%s", redirectURL, token, state)
			http.Redirect(w, r, url, http.StatusTemporaryRedirect)
			return
		}
		w.Header().Set("WWW-Authenticate", "Basic")
		http.Error(w, "Authentication required", http.StatusUnauthorized)
	}
}

func createBasicAuthJWT(subject string, emailOptional string, key interface{}) string {
	numericTime := time.Now().Add(expirationPeriod * time.Hour).Unix()
	var email string
	if emailOptional != "" {
		email = emailOptional
	} else {
		email = fmt.Sprintf("%s@tweek-basic-auth.com", subject)
	}
	claims := TweekClaims{
		subject,
		email,
		jwt.StandardClaims{
			Issuer:    "tweek-basic-auth",
			Subject:   subject,
			ExpiresAt: numericTime,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	token.Header["typ"] = "JWT"
	token.Header["alg"] = "RS256"

	tokenStr, _ := token.SignedString(key)
	return tokenStr
}

package security

import (
	"context"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"fmt"
	"log"
	"net/http"

	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
	"github.com/Soluto/tweek/services/secure-gateway/audit"
	"github.com/Soluto/tweek/services/secure-gateway/externalApps"
	jwt "github.com/dgrijalva/jwt-go"
	"github.com/dgrijalva/jwt-go/request"
	"github.com/lestrrat-go/jwx/jwk"

	"github.com/urfave/negroni"
)

type userInfoKeyType string

// UserInfoKey is used to store and fetch user info from the context
const UserInfoKey userInfoKeyType = "UserInfo"

type userInfo struct {
	sub    string
	email  string
	name   string
	issuer string
	jwt.StandardClaims
}

// UserInfo struct hold the information regarding the user
type UserInfo interface {
	Sub() string
	Email() string
	Name() string
	Issuer() string
	Claims() jwt.StandardClaims
}

func (u *userInfo) Sub() string                { return u.sub }
func (u *userInfo) Email() string              { return u.email }
func (u *userInfo) Name() string               { return u.name }
func (u *userInfo) Issuer() string             { return u.issuer }
func (u *userInfo) Claims() jwt.StandardClaims { return u.StandardClaims }

// AuthenticationMiddleware enriches the request's context with the user info from JWT
func AuthenticationMiddleware(configuration *appConfig.Security, auditor audit.Auditor) negroni.HandlerFunc {
	return negroni.HandlerFunc(func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		info, err := userInfoFromRequest(r, configuration)
		if err != nil {
			auditor.TokenError(err)
			log.Println("Error extracting the user from the request", err)
			next(rw, r)
			return
		}

		newRequest := r.WithContext(context.WithValue(r.Context(), UserInfoKey, info))
		next(rw, newRequest)
	})
}

func userInfoFromRequest(req *http.Request, configuration *appConfig.Security) (UserInfo, error) {
	if !configuration.Enforce {
		info := &userInfo{email: "test@test.test", name: "test", issuer: "tweek"}
		return info, nil
	}

	token, err := request.ParseFromRequest(req, request.OAuth2Extractor, func(t *jwt.Token) (interface{}, error) {
		claims := t.Claims.(jwt.MapClaims)
		if issuer, ok := claims["iss"].(string); ok {
			if issuer == "tweek" || issuer == "tweek-basic-auth" {
				return getGitKey(&configuration.TweekSecretKey)
			}

			if keyID, ok := t.Header["kid"].(string); ok {
				return getKeyByIssuer(issuer, keyID, configuration.Auth.Providers)
			}

			return nil, fmt.Errorf("No keyId in header")
		}
		return nil, fmt.Errorf("No issuer in claims")
	})

	if err == nil {
		query := req.URL.Query()
		var name, email string
		if name = query.Get("name"); len(name) == 0 {
			name = "anonymous"
		}
		if email = query.Get("email"); len(email) == 0 {
			email = "anonymous"
		}

		claims := token.Claims.(jwt.MapClaims)
		info := &userInfo{
			sub:    claims["sub"].(string),
			issuer: claims["iss"].(string),
			name:   name,
			email:  email,
		}
		return info, nil
	}

	if err != request.ErrNoTokenInRequest {
		return nil, err
	}

	var clientID, clientSecret string
	var ok bool

	if clientID, clientSecret, ok = req.BasicAuth(); !ok {
		clientID = req.Header.Get("x-client-id")
		clientSecret = req.Header.Get("x-client-secret")
	}

	ok, err = externalApps.ValidateCredentials(clientID, clientSecret)
	if err != nil {
		return nil, err
	}

	if ok {
		return &userInfo{sub: clientID}, nil
	}
	return nil, errors.New("Neither access token nor credentials were provided")
}

func getKeyByIssuer(issuer, keyID string, providers map[string]appConfig.AuthProvider) (interface{}, error) {
	if provider, exists := getProviderByIssuer(issuer, providers); exists {
		return getJWKByEndpoint(provider.JWKSURL, keyID)
	}
	return nil, fmt.Errorf("Unknown issuer %s", issuer)
}

func getProviderByIssuer(issuer string, providers map[string]appConfig.AuthProvider) (*appConfig.AuthProvider, bool) {
	for _, provider := range providers {
		if provider.Issuer == issuer {
			return &provider, true
		}
	}
	return nil, false
}

func getGitKey(keyEnv *appConfig.EnvInlineOrPath) (interface{}, error) {
	pemFile, err := appConfig.HandleEnvInlineOrPath(keyEnv)
	if err != nil {
		return nil, err
	}
	pemBlock, _ := pem.Decode(pemFile)
	if pemBlock == nil {
		return nil, errors.New("no PEM found")
	}
	key, err := x509.ParsePKCS1PrivateKey(pemBlock.Bytes)
	if err != nil {
		return nil, err
	}
	rsaPublicKey := key.Public()
	return rsaPublicKey, nil
}

func getJWKByEndpoint(endpoint, keyID string) (interface{}, error) {
	keySet, err := jwk.FetchHTTP(endpoint)
	if err != nil {
		return nil, err
	}
	k := keySet.LookupKeyID(keyID)
	if len(k) == 0 {
		return nil, fmt.Errorf("Key %s not found at %s", keyID, endpoint)
	}
	if len(k) > 1 {
		return nil, fmt.Errorf("Unexpected error, more than 1 key %s found at %s", keyID, endpoint)
	}
	return k[0].Materialize()
}

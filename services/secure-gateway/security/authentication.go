package security

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	jwt "github.com/dgrijalva/jwt-go" // jwt types
	"github.com/dgrijalva/jwt-go/request"
	"github.com/lestrrat/go-jwx/jwk"

	"github.com/mitchellh/mapstructure"

	"github.com/urfave/negroni"
)

type userInfoKeyType string

// UserInfoKey is used to store and fetch user info from the context
const UserInfoKey userInfoKeyType = "UserInfo"

type userInfo struct {
	email string `json:"email"`
	name  string `json:"name"`
	jwt.StandardClaims
}

// UserInfo struct hold the information regarding the user
type UserInfo interface {
	Email() string
	Name() string
	Claims() jwt.StandardClaims
}

func (u *userInfo) Email() string              { return u.email }
func (u *userInfo) Name() string               { return u.name }
func (u *userInfo) Claims() jwt.StandardClaims { return u.StandardClaims }

// UserInfoFromRequest return the user information from request
func UserInfoFromRequest(req *http.Request, configuration *config.Security) (UserInfo, error) {
	info := &userInfo{}
	token, err := request.ParseFromRequest(req, request.OAuth2Extractor, func(t *jwt.Token) (interface{}, error) {
		issuer := "AA" //t.Claims.(jwt.MapClaims)["iss"].(string)
		keyID := "BB"  // t.Header["kid"].(string)
		return getKeyByIssuer(issuer, keyID, configuration)
	})

	if err != nil {
		return nil, err
	}

	claims := token.Claims.(jwt.MapClaims)
	mapstructure.Decode(info, claims)

	return info, nil
}

// UserInfoMiddleware enriches the request's context with the user info from JWT
func UserInfoMiddleware(configuration *config.Security) negroni.HandlerFunc {
	return negroni.HandlerFunc(func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		info, err := UserInfoFromRequest(r, configuration)
		if err != nil {
			log.Println("Error extracting the user from the request", err)
			next(rw, r)
			return
		}

		ctx := context.WithValue(r.Context(), UserInfoKey, info)
		newRequest := r.WithContext(ctx)
		next(rw, newRequest)
	})
}

func getKeyByIssuer(issuer, keyID string, configuration *config.Security) (interface{}, error) {
	switch issuer {
	case "https://accounts.google.com":
		return getGoogleKey(keyID)
	case fmt.Sprintf("https://sts.windows.net/%s/", configuration.AzureTenantID):
		return getAzureADKey(configuration.AzureTenantID, keyID)
	default:
		return nil, fmt.Errorf("Unknown issuer %s", issuer)
	}
}

func getGoogleKey(keyID string) (interface{}, error) {
	endpoint := "https://www.googleapis.com/oauth2/v3/certs"
	return getJWKByEndpoint(endpoint, keyID)
}

func getAzureADKey(tenantID string, keyID string) (interface{}, error) {
	endpoint := fmt.Sprintf("https://login.microsoftonline.com/%v/discovery/v2.0/keys", tenantID)
	return getJWKByEndpoint(endpoint, keyID)
}

func getJWKByEndpoint(endpoint, keyID string) (interface{}, error) {
	keySet, err := jwk.FetchHTTP(endpoint)
	if err != nil {
		return "", err
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

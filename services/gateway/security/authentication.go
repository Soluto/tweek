package security

import (
	"context"
	"fmt"
	"net/http"
	"net/url"

	"tweek-gateway/appConfig"
	"tweek-gateway/audit"
	"tweek-gateway/externalApps"

	jwt "github.com/dgrijalva/jwt-go"
	"github.com/dgrijalva/jwt-go/request"

	"github.com/sirupsen/logrus"
	"github.com/urfave/negroni"
)

type userInfoKeyType string

type Subject struct {
	User  string
	Group string
}

func (sub *Subject) String() string {
	return fmt.Sprintf("%s:%s", sub.Group, sub.User)
}

// UserInfoKey is used to store and fetch user info from the context
const UserInfoKey userInfoKeyType = "UserInfo"

type userInfo struct {
	sub    *Subject
	email  string
	name   string
	issuer string
	jwt.StandardClaims
}

// UserInfo struct hold the information regarding the user
type UserInfo interface {
	Sub() *Subject
	Email() string
	Name() string
	Issuer() string
	Claims() jwt.StandardClaims
}

func (u *userInfo) Sub() *Subject              { return u.sub }
func (u *userInfo) Email() string              { return u.email }
func (u *userInfo) Name() string               { return u.name }
func (u *userInfo) Issuer() string             { return u.issuer }
func (u *userInfo) Claims() jwt.StandardClaims { return u.StandardClaims }

var tweekPrivateKey interface{}

// AuthenticationMiddleware enriches the request's context with the user info from JWT
func AuthenticationMiddleware(configuration *appConfig.Security, extractor SubjectExtractor, auditor audit.Auditor) negroni.HandlerFunc {
	var err error
	tweekPrivateKey, err = getPrivateKey(&configuration.TweekSecretKey)
	if err != nil {
		logrus.Panicln("Error reading tweek private key", err)
	}
	var jwksEndpoints []string
	for _, issuer := range configuration.Auth.Providers {
		jwksEndpoints = append(jwksEndpoints, issuer.JWKSURL)
	}
	LoadAllEndpoints(jwksEndpoints)
	RefreshEndpoints(jwksEndpoints)
	return negroni.HandlerFunc(func(rw http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		info, err := userInfoFromRequest(r, configuration, extractor)
		if err != nil {
			auditor.TokenError(err)
			logrus.WithError(err).Error("Error extracting the user from the request")
			next(rw, r)
			return
		}

		newRequest := r.WithContext(context.WithValue(r.Context(), UserInfoKey, info))
		next(rw, newRequest)
	})
}

func userInfoFromRequest(req *http.Request, configuration *appConfig.Security, extractor SubjectExtractor) (UserInfo, error) {
	var claims jwt.MapClaims
	token, err := request.ParseFromRequest(req, request.AuthorizationHeaderExtractor, func(t *jwt.Token) (interface{}, error) {
		claims := t.Claims.(jwt.MapClaims)
		if issuer, ok := claims["iss"].(string); ok {
			if issuer == "tweek" || issuer == "tweek-basic-auth" {
				return tweekPrivateKey, nil
			}

			if keyID, ok := t.Header["kid"].(string); ok {
				return getKeyByIssuer(issuer, keyID, configuration.Auth.Providers)
			}

			return nil, fmt.Errorf("No keyId in header")
		}
		return nil, fmt.Errorf("No issuer in claims")
	})

	if err != nil && err != request.ErrNoTokenInRequest {
		return nil, err
	}

	var sub *Subject
	var issuer string

	if err == request.ErrNoTokenInRequest {
		clientID := req.Header.Get("x-client-id")
		clientSecret := req.Header.Get("x-client-secret")

		if len(clientID) == 0 && len(clientSecret) == 0 {
			sub = &Subject{User: "anonymous", Group: "anonymous"}
			issuer = "none"
		} else {
			validateCredentialsErr := externalApps.ValidateCredentials(clientID, clientSecret)
			if validateCredentialsErr != nil {
				logrus.WithError(validateCredentialsErr).WithField("clientID", clientID).Error("Couldn't validate app for clientID")
				return nil, validateCredentialsErr
			}

			sub = &Subject{User: clientID, Group: "externalapps"}
			issuer = "tweek-externalapps"
		}

	} else {
		var extractSubjectErr error
		claims = token.Claims.(jwt.MapClaims)
		issuer = claims["iss"].(string)
		if issuer == "tweek-basic-auth" {
			sub = &Subject{User: claims["sub"].(string), Group: "externalapps"}
		} else {
			sub, extractSubjectErr = extractor.ExtractSubject(req.Context(), claims)
			if extractSubjectErr != nil {
				logrus.WithError(extractSubjectErr).Error("Failed to extract user info from JWT claims")
				return nil, fmt.Errorf("Failed to extract user info from JWT claims")
			}
		}

	}

	var name, email string = getNameAndEmail(req.URL, claims, sub)

	info := &userInfo{
		sub:    sub,
		issuer: issuer,
		name:   name,
		email:  email,
	}
	return info, nil
}

func getNameAndEmail(url *url.URL, claims jwt.MapClaims, subject *Subject) (name, email string) {
	query := url.Query()

	if len(query.Get("author.name")) != 0 {
		name = query.Get("author.name")
	} else {
		if claims["name"] != nil {
			name = claims["name"].(string)
		}
		if len(name) == 0 {
			name = fmt.Sprintf("%s %s", subject.Group, subject.User)
		}
	}

	if len(query.Get("author.email")) != 0 {
		email = query.Get("author.email")
	} else {
		if claims["email"] != nil {
			email = claims["email"].(string)
		}
		if len(email) == 0 {
			email = fmt.Sprintf("%s+%s@tweek", subject.Group, subject.User)
		}
	}

	return name, email
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

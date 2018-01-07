package jwtCreator

import (
	"os"
	"time"

	jwt "github.com/dgrijalva/jwt-go" // jwt types
)

type tweekClaims struct {
	name string
	jwt.StandardClaims
}

// JWTToken struct that contains one field - signed jwt
type JWTToken struct {
	TokenStr string
}

const expirationPeriod = 24

// InitJWT - inits jwt
func InitJWT() *JWTToken {
	token := &JWTToken{
		createNewJWT(),
	}
	go setExpirationTimer(token)
	return token
}

func createNewJWT() string {
	numericTime := time.Now().Add(expirationPeriod * time.Hour).Unix()
	claims := tweekClaims{
		"tweek-internal",
		jwt.StandardClaims{
			Issuer:    "tweek",
			ExpiresAt: numericTime,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	token.Header["typ"] = "JWT"
	token.Header["alg"] = "RS256"

	key := os.Getenv("jwt-key")

	tokenStr, _ := token.SignedString(key)
	return tokenStr
}

func setExpirationTimer(token *JWTToken) {
	timer := time.Tick(expirationPeriod * time.Hour)

	for range timer {
		tokenStr := createNewJWT()
		token.TokenStr = tokenStr
	}
}

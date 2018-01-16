package security

import (
	"os"
	"sync"
	"time"

	jwt "github.com/dgrijalva/jwt-go" // jwt types
)

type tweekClaims struct {
	name string
	jwt.StandardClaims
}

// JWTTokenData struct that contains one field - signed jwt
type JWTTokenData struct {
	tokenStr string
	lock     sync.RWMutex
}

type JWTToken interface {
	GetToken() string
	SetToken(tokenStr string)
}

func (t *JWTTokenData) GetToken() string {
	t.lock.RLock()
	defer t.lock.RUnlock()
	return t.tokenStr
}

func (t *JWTTokenData) SetToken(tokenStr string) {
	t.lock.Lock()
	defer t.lock.Unlock()
	t.tokenStr = tokenStr
}

const expirationPeriod = 24

// InitJWT - inits jwt
func InitJWT() JWTToken {
	token := &JWTTokenData{
		tokenStr: createNewJWT(),
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

func setExpirationTimer(token *JWTTokenData) {
	timer := time.Tick(expirationPeriod * time.Hour)

	for range timer {
		tokenStr := createNewJWT()
		token.SetToken(tokenStr)
	}
}

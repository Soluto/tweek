package security

import (
	"crypto/x509"
	"encoding/pem"
	"log"
	"sync"
	"time"

	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
	"github.com/dgrijalva/jwt-go"
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

// GetToken gets token
func (t *JWTTokenData) GetToken() string {
	t.lock.RLock()
	defer t.lock.RUnlock()
	return t.tokenStr
}

// SetToken sets token
func (t *JWTTokenData) SetToken(tokenStr string) {
	t.lock.Lock()
	defer t.lock.Unlock()
	t.tokenStr = tokenStr
}

const expirationPeriod = 24

// InitJWT - inits jwt
func InitJWT(keyEnv *appConfig.EnvInlineOrPath) JWTToken {
	key, err := getPrivateKey(keyEnv)
	if err != nil {
		log.Panicln("Private key retrieving failed:", err)
	}

	token := &JWTTokenData{
		tokenStr: createNewJWT(key),
	}

	go setExpirationTimer(token, key)
	return token
}

func createNewJWT(key interface{}) string {
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

	tokenStr, _ := token.SignedString(key)
	return tokenStr
}

func setExpirationTimer(token *JWTTokenData, key interface{}) {
	timer := time.Tick(expirationPeriod * time.Hour)

	for range timer {
		tokenStr := createNewJWT(key)
		token.SetToken(tokenStr)
	}
}

func getPrivateKey(keyEnv *appConfig.EnvInlineOrPath) (interface{}, error) {
	pemFile, err := appConfig.HandleEnvInlineOrPath(keyEnv)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(pemFile)
	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		key, err = x509.ParsePKCS1PrivateKey(block.Bytes)
		if err != nil {
			return nil, err
		}
	}
	return key, nil
}

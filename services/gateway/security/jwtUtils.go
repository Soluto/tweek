package security

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/pem"
	"errors"
	"sync"
	"time"

	"tweek-gateway/appConfig"

	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/sirupsen/logrus"
)

type TweekClaims struct {
	Name  string `json:"name"`
	Email string `json:"email"`
	jwt.RegisteredClaims
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
		logrus.WithError(err).Panic("Private key retrieving failed")
	}

	token := &JWTTokenData{
		tokenStr: createNewJWT(key),
	}

	go setExpirationTimer(token, key)
	return token
}

func createNewJWT(key interface{}) string {
	numericTime := jwt.NewNumericDate(time.Now().Add(expirationPeriod * time.Hour))
	claims := TweekClaims{
		"tweek",
		"tweek@soluto.com",
		jwt.RegisteredClaims{
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

func getPrivateKey(keyEnv *appConfig.EnvInlineOrPath) (*rsa.PrivateKey, error) {
	pemFile, err := appConfig.HandleEnvInlineOrPath(keyEnv)
	if err != nil {
		return nil, err
	}

	block, _ := pem.Decode(pemFile)
	if block == nil {
		return nil, errors.New("no PEM found")
	}
	key, err := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err != nil {
		key, err = x509.ParsePKCS1PrivateKey(block.Bytes)
		if err != nil {
			return nil, err
		}
	}

	rsaKey, ok := key.(*rsa.PrivateKey)
	if !ok {
		return nil, errors.New("key block is not of type RSA")
	}

	return rsaKey, nil
}

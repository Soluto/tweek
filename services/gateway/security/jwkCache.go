package security

import (
	"fmt"
	"time"

	"github.com/lestrrat-go/jwx/jwk"
	"github.com/sirupsen/logrus"
)

type jwkResult struct {
	set   *jwk.Set
	err   error
	timer *time.Timer
}

var jwkCache map[string]jwkResult

func init() {
	jwkCache = map[string]jwkResult{}
}

func getJWKByEndpoint(endpoint, keyID string) (interface{}, error) {
	keys, err := getCachedJwk(endpoint)
	if err != nil {
		return nil, err
	}
	k := keys.LookupKeyID(keyID)
	if len(k) == 0 {
		keys, err = loadEndpoint(endpoint)
		if err != nil {
			return nil, err
		}
		k = keys.LookupKeyID(keyID)
		if len(k) == 0 {
			return nil, fmt.Errorf("Key %s not found at %s", keyID, endpoint)
		}
	}
	if len(k) > 1 {
		return nil, fmt.Errorf("Unexpected error, more than 1 key %s found at %s", keyID, endpoint)
	}
	return k[0].Materialize()
}

// LoadAllEndpoints loads all the endpoints
func LoadAllEndpoints(endpoints []string) {
	for _, ep := range endpoints {
		loadEndpoint(ep)
	}
}

// RefreshEndpoints refreshes endpoints
func RefreshEndpoints(endpoints []string) {
	ticker := time.NewTicker(time.Hour * 24)
	go func() {
		for true {
			<-ticker.C
			for _, ep := range endpoints {
				loadEndpoint(ep)
			}
		}
	}()
}

func loadEndpoint(endpoint string) (*jwk.Set, error) {
	keySet, err := jwk.FetchHTTP(endpoint)
	var timer *time.Timer

	if err != nil {
		if cached, ok := jwkCache[endpoint]; ok && cached.timer != nil {
			cached.timer.Stop()
		}
		timer = time.AfterFunc(time.Second*5, func() { loadEndpoint(endpoint) })
		logrus.WithError(err).WithField("endpoint", endpoint).Error("Unable to load keys for endpoint")
	}
	jwkCache[endpoint] = jwkResult{
		keySet,
		err,
		timer,
	}
	return keySet, err
}

func getCachedJwk(endpoint string) (*jwk.Set, error) {
	result, ok := jwkCache[endpoint]
	if !ok {
		return nil, fmt.Errorf("No keys found for endpoint %s", endpoint)
	}

	return result.set, result.err
}

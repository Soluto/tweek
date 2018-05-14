package security

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/lestrrat-go/jwx/jwk"
)

type keysetWithExpiration struct {
	Keyset     *jwk.Set
	Expiration time.Time
}

type jwkCacheData map[string]*keysetWithExpiration

var jwkCache jwkCacheData

var cacheLock sync.RWMutex

func init() {
	jwkCache = jwkCacheData{}
}

func getJWKByEndpoint(endpoint, keyID string) (interface{}, error) {
	refreshEndpointKeys(endpoint)
	k := jwkCache[endpoint].Keyset.LookupKeyID(keyID)
	if len(k) == 0 {
		return nil, fmt.Errorf("Key %s not found at %s", keyID, endpoint)
	}
	if len(k) > 1 {
		return nil, fmt.Errorf("Unexpected error, more than 1 key %s found at %s", keyID, endpoint)
	}
	return k[0].Materialize()
}

func refreshEndpointKeys(endpoint string) error {
	cacheLock.RLock()
	if _, found := jwkCache[endpoint]; found && jwkCache[endpoint].Expiration.After(time.Now()) {
		cacheLock.RUnlock()
		return nil
	}
	cacheLock.RUnlock()

	cacheLock.Lock()
	defer cacheLock.Unlock()

	response, err := http.Head(endpoint)
	if err != nil {
		return err
	}
	keySet, err := jwk.FetchHTTP(endpoint)
	if err != nil {
		return err
	}
	expires, err := http.ParseTime(response.Header.Get("expires"))
	if err != nil {
		expires = time.Now().Add(time.Hour)
	}

	jwkCache[endpoint] = &keysetWithExpiration{
		Keyset:     keySet,
		Expiration: expires,
	}

	return nil
}

package security

import (
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/lestrrat-go/jwx/jwk"
)

type keysetWithExtra struct {
	Keyset     *jwk.Set
	Expiration time.Time
	Timer      *time.Timer
	Mutex      sync.Mutex
}

var jwkCache map[string]keysetWithExtra

func init() {
	jwkCache = map[string]keysetWithExtra{}
}

func getJWKByEndpoint(endpoint, keyID string) (interface{}, error) {
	err := refreshEndpointKeys(endpoint, keyID, func(s string) {
		performRefresh(s)
		ensureBackgroundTimer(s)
	})
	if err != nil {
		return nil, err
	}

	keys, _ := jwkCache[endpoint]
	k := keys.Keyset.LookupKeyID(keyID)
	if len(k) == 0 {
		return nil, fmt.Errorf("Key %s not found at %s", keyID, endpoint)
	}
	if len(k) > 1 {
		return nil, fmt.Errorf("Unexpected error, more than 1 key %s found at %s", keyID, endpoint)
	}
	return k[0].Materialize()
}

func refreshEndpointKeys(endpoint string, kid string, refresh func(string)) error {
	var keyset keysetWithExtra
	var found bool
	if keyset, found = jwkCache[endpoint]; found && keyset.Expiration.After(time.Now()) {
		return nil
	}
	if !found {
		keyset.Mutex.Lock()
		refresh(endpoint)
		keyset.Mutex.Unlock()
		return nil
	}
	k := keyset.Keyset.LookupKeyID(kid)
	if len(k) == 0 {
		keyset.Mutex.Lock()
		refresh(endpoint)
		keyset.Mutex.Unlock()
	}

	return nil
}

func performRefresh(endpoint string) error {
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

	jwkCache[endpoint] = keysetWithExtra{
		Keyset:     keySet,
		Expiration: expires,
	}
	return nil
}

func ensureBackgroundTimer(endpoint string) {
	if keyset, found := jwkCache[endpoint]; found {
		durationToNext := time.Since(keyset.Expiration) - time.Since(time.Now()) - time.Minute
		if durationToNext < 0 {
			performRefresh(endpoint)
			return
		}
		if keyset.Timer == nil {
			keyset.Timer = time.NewTimer(durationToNext)
			go func() {
				<-keyset.Timer.C
				performRefresh(endpoint)
				keyset.Timer = nil
			}()
		}
	}
}

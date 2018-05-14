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

var jwkCache sync.Map

func init() {
	jwkCache = sync.Map{}
}

func getJWKByEndpoint(endpoint, keyID string) (interface{}, error) {
	if err := refreshEndpointKeys(endpoint); err != nil {
		return nil, err
	}
	keys, _ := jwkCache.Load(endpoint)
	k := keys.(keysetWithExpiration).Keyset.LookupKeyID(keyID)
	if len(k) == 0 {
		return nil, fmt.Errorf("Key %s not found at %s", keyID, endpoint)
	}
	if len(k) > 1 {
		return nil, fmt.Errorf("Unexpected error, more than 1 key %s found at %s", keyID, endpoint)
	}
	return k[0].Materialize()
}

func refreshEndpointKeys(endpoint string) error {
	if keyset, found := jwkCache.Load(endpoint); found && keyset.(keysetWithExpiration).Expiration.After(time.Now()) {
		return nil
	}

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

	jwkCache.Store(endpoint, keysetWithExpiration{
		Keyset:     keySet,
		Expiration: expires,
	})

	return nil
}

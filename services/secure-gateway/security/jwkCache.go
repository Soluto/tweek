package security

import (
	"fmt"
	"log"
	"time"

	"github.com/lestrrat-go/jwx/jwk"
)

var jwkCache map[string]*jwk.Set

func init() {
	jwkCache = map[string]*jwk.Set{}
}

func getJWKByEndpoint(endpoint, keyID string) (interface{}, error) {
	keys := jwkCache[endpoint]
	k := keys.LookupKeyID(keyID)
	if len(k) == 0 {
		return nil, fmt.Errorf("Key %s not found at %s", keyID, endpoint)
	}
	if len(k) > 1 {
		return nil, fmt.Errorf("Unexpected error, more than 1 key %s found at %s", keyID, endpoint)
	}
	return k[0].Materialize()
}

func loadAllEndpoints(endpoints []string) {
	for _, ep := range endpoints {
		loadEndpoint(ep)
	}
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

func loadEndpoint(endpoint string) {
	keySet, err := jwk.FetchHTTP(endpoint)
	if err != nil {
		log.Printf("Unable to load endpoint %s", endpoint)
	}
	jwkCache[endpoint] = keySet
}

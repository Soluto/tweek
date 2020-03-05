package security

import (
	"fmt"
	"time"

	"github.com/lestrrat-go/jwx/jwk"
	"github.com/sirupsen/logrus"
)

type jwkRecord struct {
	set *jwk.Set
	err error
}

var jwkCache map[string]*jwkRecord

func init() {
	jwkCache = map[string]*jwkRecord{}
}

func getJWKByEndpoint(endpoint, keyID string) (interface{}, error) {
	rec, ok := jwkCache[endpoint]
	if !ok {
		return nil, fmt.Errorf("No keys found for endpoint %s", endpoint)
	}

	if rec.err != nil {
		return nil, rec.err
	}

	k := rec.set.LookupKeyID(keyID)
	if len(k) == 0 {
		rec := loadEndpoint(endpoint)
		if rec.err != nil {
			return nil, rec.err
		}
		k = rec.set.LookupKeyID(keyID)
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

func loadEndpoint(endpoint string) *jwkRecord {
	return loadEndpointWithRetry(endpoint, 0)
}

func loadEndpointWithRetry(endpoint string, retryCount uint) *jwkRecord {
	rec := &jwkRecord{}
	rec.set, rec.err = jwk.FetchHTTP(endpoint)
	jwkCache[endpoint] = rec

	if rec.err != nil {
		logrus.WithError(rec.err).WithField("endpoint", endpoint).Error("Unable to load keys for endpoint")

		go func() {
			<-time.After(time.Second * (1 << retryCount))
			cached := jwkCache[endpoint]
			if cached == rec {
				nextCount := retryCount + 1
				if nextCount > 6 {
					// limit retry delay to 64 Seconds (~1 Minute)
					nextCount = 6
				}
				loadEndpointWithRetry(endpoint, nextCount)
			}
		}()
	}

	return rec
}

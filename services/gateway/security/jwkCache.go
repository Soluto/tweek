package security

import (
	"fmt"
	"sync"
	"time"

	"github.com/lestrrat-go/jwx/jwk"
	"github.com/sirupsen/logrus"
)

type jwkRecord struct {
	set     *jwk.Set
	err     error
	expired bool

	wg *sync.WaitGroup
}

var jwkCache map[string]*jwkRecord
var jwkMutex *sync.Mutex

func init() {
	jwkCache = map[string]*jwkRecord{}
	jwkMutex = &sync.Mutex{}
}

func getJWKByEndpoint(endpoint, keyID string) (interface{}, error) {
	keys, err := getCachedJwk(endpoint)
	if err != nil {
		return nil, err
	}
	k := keys.LookupKeyID(keyID)
	if len(k) == 0 {
		rec := loadEndpoint(endpoint)
		rec.wg.Wait()
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
	jwkMutex.Lock()
	defer jwkMutex.Unlock()

	rec, ok := jwkCache[endpoint]
	if !ok || rec.expired {
		rec = &jwkRecord{
			wg: &sync.WaitGroup{},
		}
		rec.wg.Add(1)
		jwkCache[endpoint] = rec

		go func() {
			defer rec.wg.Done()
			defer time.AfterFunc(time.Second*5, func() { rec.expired = true })

			rec.set, rec.err = jwk.FetchHTTP(endpoint)
			if rec.err != nil {
				logrus.WithError(rec.err).WithField("endpoint", endpoint).Error("Unable to load keys for endpoint")
			}
		}()
	}

	return rec
}

func getCachedJwk(endpoint string) (*jwk.Set, error) {
	rec, ok := jwkCache[endpoint]
	if !ok {
		return nil, fmt.Errorf("No keys found for endpoint %s", endpoint)
	}

	if rec.err != nil {
		rec = loadEndpoint(endpoint)
	}

	rec.wg.Wait()

	return rec.set, rec.err
}

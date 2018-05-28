package externalApps

import (
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"errors"
	"io/ioutil"
	"log"
	"runtime"

	"github.com/Soluto/tweek/services/gateway/appConfig"
	"github.com/minio/minio-go"
	"github.com/nats-io/go-nats"
	"golang.org/x/crypto/pbkdf2"
)

// ExternalApp - type to store external app info
type ExternalApp struct {
	Name       string      `json:"name"`
	Version    string      `json:"version"`
	SecretKeys []SecretKey `json:"secretKeys"`
}

// SecretKey - type to store secret key data
type SecretKey struct {
	Salt         string `json:"salt"`
	Hash         string `json:"hash"`
	CreationDate string `json:"creationDate"`
}

type externalAppsRepo struct {
	externalApps     map[string]ExternalApp
	natsSubscription *nats.Subscription
	minioClient      *minio.Client
}

var repo externalAppsRepo

// ValidateCredentials - checks appID and secretKey are valid
func ValidateCredentials(appID, appSecretKey string) (bool, error) {
	if appID == "" || appSecretKey == "" {
		return false, errors.New("Invalid params")
	}

	app, exists := repo.externalApps[appID]
	if !exists {
		return false, nil
	}

	for _, appKey := range app.SecretKeys {
		if isValid := compareKeys(appKey, appSecretKey); isValid {
			return true, nil
		}
	}

	return false, nil
}

func compareKeys(appKey SecretKey, secretKey string) bool {

	saltBuf, err := hex.DecodeString(appKey.Salt)
	if err != nil {
		log.Panicln("Salt decode failed:", err)
	}

	hashBuf := pbkdf2.Key([]byte(secretKey), saltBuf, 100, 512, sha512.New)
	hash := hex.EncodeToString(hashBuf)

	return hash == appKey.Hash
}

// Init - function to init external apps
func Init(cfg *appConfig.PolicyStorage) {
	log.Println("Initializing external apps...")
	repo = externalAppsRepo{}

	client, err := minio.New(cfg.MinioEndpoint, cfg.MinioAccessKey, cfg.MinioSecretKey, cfg.MinioUseSSL)
	if err != nil {
		log.Panic("External apps init error: ", err)
	}
	repo.minioClient = client

	nc, err := nats.Connect(cfg.NatsEndpoint)
	if err != nil {
		log.Panic("External apps init error: ", err)
	}

	subscription, err := nc.Subscribe("version", refreshApps(cfg))
	repo.natsSubscription = subscription
	runtime.SetFinalizer(&repo, finilizer)

	refreshApps(cfg)
}

func refreshApps(cfg *appConfig.PolicyStorage) nats.MsgHandler {
	return func(msg *nats.Msg) {
		log.Println("Refreshing external apps...")
		obj, err := repo.minioClient.GetObject(cfg.MinioBucketName, "external_apps.json", minio.GetObjectOptions{})
		if err != nil {
			log.Panic("Get external apps from minio failed: ", err)
		}
		buf, err := ioutil.ReadAll(obj)
		if err != nil {
			log.Panic("Read external apps object failed:", err)
		}
		var extApps map[string]ExternalApp
		err = json.Unmarshal(buf, &extApps)
		if err != nil {
			log.Panic("Refresh app failed: deserialize object ")
		}
		repo.externalApps = extApps
	}
}

func finilizer(r *externalAppsRepo) {
	if r.natsSubscription != nil && r.natsSubscription.IsValid() {
		r.natsSubscription.Unsubscribe()
	}
	return
}

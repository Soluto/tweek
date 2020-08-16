package externalApps

import (
	"crypto/sha512"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"runtime"
	"time"
	"tweek-gateway/appConfig"

	minio "github.com/minio/minio-go"
	nats "github.com/nats-io/nats.go"
	"github.com/sirupsen/logrus"
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
func ValidateCredentials(appID, appSecretKey string) error {
	if appID == "" || appSecretKey == "" {
		return errors.New("Invalid params")
	}

	app, exists := repo.externalApps[appID]
	if !exists {
		return errors.New("The given appId does not exist")
	}

	for _, appKey := range app.SecretKeys {
		if isValid := compareKeys(appKey, appSecretKey); isValid {
			return nil
		}
	}

	return errors.New("The given appSecretKey is invalid")
}

func compareKeys(appKey SecretKey, secretKey string) bool {

	saltBuf, err := hex.DecodeString(appKey.Salt)
	if err != nil {
		logrus.WithError(err).Panic("Salt decoding failed")
	}

	secretKeyBuf, err := base64.StdEncoding.DecodeString(secretKey)
	if err != nil {
		logrus.WithError(err).Error("Invalid secret key format")
		return false
	}

	hashBuf := pbkdf2.Key(secretKeyBuf, saltBuf, 100, 512, sha512.New)
	hash := hex.EncodeToString(hashBuf)

	return hash == appKey.Hash
}

func verifyMinioReadiness(mc *minio.Client, bucket string) {
	for i := 0; ; i++ {
		found, err := mc.BucketExists(bucket)
		if err == nil && !found {
			err = fmt.Errorf("Minio bucket doesn't not exist")
		}
		if err == nil {
			_, err = mc.StatObject(bucket, "versions", minio.StatObjectOptions{})
		}
		if err == nil {
			logrus.Infoln("Minio bucket is ready")
			break
		} else {
			if i > 10 {
				logrus.WithError(err).Panic("Minio bucket not ready")
			}
			logrus.WithError(err).Infoln("retrying getting Minio bucket")
			time.Sleep(2 * time.Second)
		}
	}
}

// Init - function to init external apps
func Init(cfg *appConfig.PolicyStorage) {
	logrus.Info("Initializing external apps...")
	repo = externalAppsRepo{}

	client, err := minio.New(cfg.MinioEndpoint, cfg.MinioAccessKey, cfg.MinioSecretKey, cfg.MinioUseSSL)
	if err != nil {
		logrus.WithError(err).Panic("External apps init error")
	}
	repo.minioClient = client

	nc, err := nats.Connect(cfg.NatsEndpoint)
	if err != nil {
		logrus.WithError(err).Panic("External apps init error")
	}

	verifyMinioReadiness(client, cfg.MinioBucketName)

	subscription, err := nc.Subscribe("version", refreshApps(cfg))
	repo.natsSubscription = subscription
	runtime.SetFinalizer(&repo, finalizer)

	refreshApps(cfg)(&nats.Msg{})
}

func refreshApps(cfg *appConfig.PolicyStorage) nats.MsgHandler {
	return func(msg *nats.Msg) {
		logrus.Info("Refreshing external apps...")
		reader, err := repo.minioClient.GetObject(cfg.MinioBucketName, "external_apps.json", minio.GetObjectOptions{})
		if err != nil {
			logrus.WithError(err).Panic("Get external apps from minio failed")
		}
		defer reader.Close()
		buf, err := ioutil.ReadAll(reader)
		if err != nil {
			logrus.WithError(err).Panic("Read external apps object failed")
		}
		var extApps map[string]ExternalApp
		err = json.Unmarshal(buf, &extApps)
		if err != nil {
			logrus.WithError(err).Panic("Refresh app failed: deserialize object")
		}
		repo.externalApps = extApps
		logrus.Info("Done refreshing external apps.")
	}
}

func finalizer(r *externalAppsRepo) {
	if r.natsSubscription != nil && r.natsSubscription.IsValid() {
		r.natsSubscription.Unsubscribe()
	}
	return
}

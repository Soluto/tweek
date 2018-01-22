package policyStorage

import (
	"errors"
	"log"
	"path"
	"sync"

	"github.com/Soluto/tweek/services/secure-gateway/config"
	"github.com/casbin/casbin/file-adapter"
	"github.com/casbin/casbin/model"
	"github.com/casbin/casbin/persist"
	"github.com/minio/minio-go"
)

var (
	// ErrUnsupportedOperation is the error returned for unsupported operations
	ErrUnsupportedOperation = errors.New("Unsupported operation")
)

type minioCasbinAdapter struct {
	client      *minio.Client
	fileadapter persist.Adapter
	upstream    string
	lock        sync.RWMutex
	workdir     string
}

func (a *minioCasbinAdapter) LoadPolicy(model model.Model) error {
	return ErrUnsupportedOperation
}

func (a *minioCasbinAdapter) SavePolicy(model model.Model) error {
	return ErrUnsupportedOperation
}

func (a *minioCasbinAdapter) AddPolicy(sec string, ptype string, rule []string) error {
	return ErrUnsupportedOperation
}

func (a *minioCasbinAdapter) RemovePolicy(sec string, ptype string, rule []string) error {
	return ErrUnsupportedOperation
}

func (a *minioCasbinAdapter) RemoveFilteredPolicy(sec string, ptype string, fieldIndex int, fieldValues ...string) error {
	return ErrUnsupportedOperation
}

func New(workDir string, minioConfig *config.PolicyStorage) (result persist.Adapter, err error) {

	minioClient, err := minio.New(minioConfig.UpstreamURL, minioConfig.AccessKey, minioConfig.SecretKey, minioConfig.UseSSL)
	if err != nil {
		log.Panicln(err)
	}

	buckerExists, err := minioClient.BucketExists(minioConfig.BuckerName)
	if err != nil {
		log.Panicln("Minio client failed to check bucket existanse :", err)
	}

	if !buckerExists {
		err := minioClient.MakeBucket(minioConfig.BuckerName, "us-east-1")
		if err != nil {
			log.Panicln("Minio client failed to create bucket :", err)
		}
	}

	filePath := path.Join(workDir, minioConfig.CasbinModel)
	error := minioClient.FGetObject(minioConfig.BuckerName, minioConfig.CasbinModel, filePath, minio.GetObjectOptions{})
	if error != nil {
		log.Panicln("Error retrieving casbin model from minio:", error)
	}

	adapter := fileadapter.NewAdapter(filePath)

	result = &minioCasbinAdapter{
		client:      minioClient,
		fileadapter: adapter,
		upstream:    minioConfig.UpstreamURL,
		workdir:     workDir,
	}

	return
}

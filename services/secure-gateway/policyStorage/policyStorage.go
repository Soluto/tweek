package policyStorage

import (
	"encoding/csv"
	"errors"
	"log"
	"os"
	"path"
	"strings"
	"sync"

	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
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
	cfg         *appConfig.PolicyStorage
	lock        sync.RWMutex
	workDir     string
}

func appendToCsv(filePath string, inlinePoliciesStr string) error {
	file, err := os.Open(filePath)
	if err != nil {
		log.Panicln("Appending inline policies failed (Openning file):", err)
	}

	r := csv.NewReader(strings.NewReader(inlinePoliciesStr))
	inlinePolicies, err := r.ReadAll()
	if err != nil {
		log.Panicln("Failed to read inline policies")
	}

	w := csv.NewWriter(file)
	err = w.WriteAll(inlinePolicies)
	if err != nil {

	}
	w.Flush()
	return nil
}

func (a *minioCasbinAdapter) LoadPolicy(model model.Model) error {
	filePath := path.Join(a.workDir, a.cfg.CasbinPolicy)
	error := a.client.FGetObject(a.cfg.MinioBucketName, a.cfg.CasbinPolicy, filePath, minio.GetObjectOptions{})
	if error != nil {
		log.Panicln("Error retrieving casbin model from minio:", error)
	}

	if inlinePolicy, ok := os.LookupEnv("CASBIN_INLINE_POLICY"); ok {
		appendToCsv(filePath, inlinePolicy)
	}

	err := a.fileadapter.LoadPolicy(model)
	if err != nil {
		log.Panicln("Casbin policy loading failed:", err)
	}
	return nil
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

// New - fetches policy from minio and returns data for casbin initialization
func New(workDir string, config *appConfig.PolicyStorage) (result persist.Adapter, err error) {

	minioClient, err := minio.New(config.MinioEndpoint, config.MinioAccessKey, config.MinioSecretKey, config.MinioUseSSL)
	if err != nil {
		log.Panicln(err)
	}

	bucketExists, err := minioClient.BucketExists(config.MinioBucketName)
	if err != nil {
		log.Panicln("Minio client failed to check bucket existence:", err)
	}
	if !bucketExists {
		log.Panicln("Minio bucket with casbin policies doesn't exist")
	}

	filePath := path.Join(workDir, config.CasbinPolicy)
	error := minioClient.FGetObject(config.MinioBucketName, config.CasbinPolicy, filePath, minio.GetObjectOptions{})
	if error != nil {
		log.Panicln("Error retrieving casbin model from minio:", error)
	}

	adapter := fileadapter.NewAdapter(filePath)

	result = &minioCasbinAdapter{
		client:      minioClient,
		fileadapter: adapter,
		cfg:         config,
		workDir:     workDir,
	}

	return
}

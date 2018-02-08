package appConfig

import (
	"log"
	"os"

	"github.com/jinzhu/configor"
)

// Upstreams is the list of upstrem URLs.
type Upstreams struct {
	API        string
	Authoring  string
	Management string
}

// V1Hosts is the list of v1 hosts
type V1Hosts struct {
	API        []string
	Authoring  []string
	Management []string
}

// Server section holds the server related configuration
type Server struct {
	Ports []int `mapstructure:"ports"`
}

// Security section hold security related configuration
type Security struct {
	AllowedIssuers     []string
	AzureTenantID      string
	TweekSecretKeyPath string
	Enforce            bool
	PolicyStorage      PolicyStorage
}

// PolicyStorage section holds the minio upstream and secret keys
type PolicyStorage struct {
	MinioEndpoint         string
	MinioBucketName       string
	MinioAccessKey        string
	MinioSecretKey        string
	MinioUseSSL           bool
	MinioPolicyObjectName string
	NatsEndpoint          string
	NatsSubject           string
	CasbinModel           string
}

// Configuration is the root element of configuration for secure-gateway
type Configuration struct {
	Upstreams Upstreams
	V1Hosts   V1Hosts
	Server    Server
	Security  Security
}

// InitConfig initializes the configuration
func InitConfig() *Configuration {
	conf := &Configuration{}

	tweekConfigor := configor.New(&configor.Config{ENVPrefix: "TWEEKGATEWAY"})

	// Loading default config file if exists
	if configFilePath, exists := os.LookupEnv("CONFIG_FILE_PATH"); exists {
		if _, err := os.Stat(configFilePath); !os.IsNotExist(err) {
			tweekConfigor.Load(conf, configFilePath)
		} else {
			log.Panicln("Config file not found", err)
		}
	} else {
		tweekConfigor.Load(conf)
	}

	// Loading provided config file
	if configFilePath, exists := os.LookupEnv("TWEEK_GATEWAY_CONFIG_FILE_PATH"); exists {
		if _, err := os.Stat(configFilePath); !os.IsNotExist(err) {
			tweekConfigor.Load(conf, configFilePath)
		}
	}
	return conf
}

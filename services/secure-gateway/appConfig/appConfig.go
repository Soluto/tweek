package appConfig

import (
	"os"

	"github.com/jinzhu/configor"
)

// Upstreams is the list of upstrem URLs.
type Upstreams struct {
	API        string `mapstructure:"api"`
	Authoring  string `mapstructure:"authoring"`
	Management string `mapstructure:"management"`
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
	AllowedIssuers     []string      `mapstructure:"allowed_issuers"`
	AzureTenantID      string        `mapstructure:"azure_tenant_id"`
	TweekSecretKeyPath string        `mapstructure:"tweek_secret_key_path"`
	Enforce            bool          `mapstructure:"enforce"`
	PolicyStorage      PolicyStorage `mapstructure:"policy_storage"`
}

// PolicyStorage section holds the minio upstream and secret keys
type PolicyStorage struct {
	MinioEndpoint   string `mapstructure:"upstream_url"`
	MinioBucketName string `mapstructure:"minio_bucket"`
	MinioAccessKey  string `mapstructure:"access_key"`
	MinioSecretKey  string `mapstructure:"secret_key"`
	MinioUseSSL     bool   `mapstructure:"use_ssl"`
	CasbinPolicy    string `mapstructure:"casbin_policy"`
	CasbinModel     string `mapstructure:"casbin_model"`
}

// Configuration is the root element of configuration for secure-gateway
type Configuration struct {
	Upstreams *Upstreams `mapstructure:"upstreams"`
	V1Hosts   *V1Hosts   `mapstructure:"v1Hosts"`
	Server    *Server    `mapstructure:"server"`
	Security  *Security  `mapstructure:"security"`
}

// InitConfig initializes the configuration
func InitConfig() *Configuration {
	conf := &Configuration{}

	tweekConfigor := configor.New(&configor.Config{ENVPrefix: "TWEEKGATEWAY"})

	// Loading default config file
	tweekConfigor.Load(conf, "gateway.json")

	// Loading provided config file
	if configFilePath, exists := os.LookupEnv("TWEEK_GATEWAY_CONFIG_FILE_PATH"); exists {
		if _, err := os.Stat(configFilePath); !os.IsNotExist(err) {
			tweekConfigor.Load(conf, configFilePath)
		}
	}

	/*configReader.SetDefault("server.ports", []int{9090})

	configReader.BindEnv("security.tweek_secret_key_path", "TWEEK")

	configReader.BindEnv("security.policy_storage.upstream_url", "MINIO_ENDPOINT")
	configReader.BindEnv("security.policy_storage.minio_bucket", "MINIO_BUCKET")
	configReader.BindEnv("security.policy_storage.access_key", "MINIO_ACCESS_KEY")
	configReader.BindEnv("security.policy_storage.secret_key", "MINIO_SECRET_KEY")
	configReader.BindEnv("security.policy_storage.use_ssl", "MINIO_SECURE")*/

	return conf
}

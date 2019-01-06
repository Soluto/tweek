package appConfig

import (
	"encoding/base64"
	"io/ioutil"
	"os"

	"github.com/jinzhu/configor"
	"github.com/sirupsen/logrus"
)

// Upstreams is the list of upstrem URLs.
type Upstreams struct {
	API        string
	Authoring  string
	Publishing string
	Editor     string
}

// V1Hosts is the list of v1 hosts
type V1Hosts struct {
	API       []string
	Authoring []string
}

// V2Route stores all routes for v2 proxy
type V2Route struct {
	RoutePathPrefix string
	RouteRegexp     string
	UpstreamPath    string
	Methods         []string
	Service         string
	UserInfo        bool
	RewriteKeyPath  bool
}

// Server section holds the server related configuration
type Server struct {
	Ports []int `mapstructure:"ports"`
}

// EnvInlineOrPath is struct to contain value inline or path to file with content
type EnvInlineOrPath struct {
	Path   string
	Inline string
}

// BasicAuth - struct with config related to Basic Auth
type BasicAuth struct {
	RedirectURLs []string `json:"redirect_urls" yaml:"redirect_urls"`
}

// AuthLogin - configuration of login information
type AuthLogin struct {
	LoginType      string                 `json:"login_type" yaml:"login_type"`
	AdditionalInfo map[string]interface{} `json:"additional_info" yaml:"additional_info"`
	Scope          string                 `json:"scope" yaml:"scope"`
	ResponseType   string                 `json:"response_type" yaml:"response_type"`
}

// AuthProvider - configuration of each auth provider
type AuthProvider struct {
	Name      string    `json:"name" yaml:"name"`
	Issuer    string    `json:"issuer" yaml:"issuer"`
	Authority string    `json:"authority" yaml:"authority"`
	ClientID  string    `json:"client_id" yaml:"client_id"`
	JWKSURL   string    `json:"jwks_uri" yaml:"jwks_uri"`
	LoginInfo AuthLogin `json:"login_info" yaml:"login_info"`
}

// Auth - struct with config related to authentication
type Auth struct {
	Providers map[string]AuthProvider
	BasicAuth BasicAuth `json:"basic_auth"`
}

// Security section holds security related configuration
type Security struct {
	TweekSecretKey EnvInlineOrPath
	PolicyStorage  PolicyStorage
	Cors           Cors
	Auth           Auth
}

// Cors stores data for CORS support
type Cors struct {
	Enabled        bool
	MaxAge         int
	AllowedOrigins []string
	AllowedMethods []string
	AllowedHeaders []string
}

// PolicyStorage section holds the minio upstream and secret keys
type PolicyStorage struct {
	MinioEndpoint   string
	MinioBucketName string
	MinioAccessKey  string
	MinioSecretKey  string
	MinioUseSSL     bool
	NatsEndpoint    string
}

// Configuration is the root element of configuration for gateway
type Configuration struct {
	Upstreams      Upstreams
	V1Hosts        V1Hosts
	V2Routes       []V2Route
	Server         Server
	Security       Security
	ConfigFilePath string
}

// InitConfig initializes the configuration
func InitConfig() *Configuration {
	conf := &Configuration{}

	tweekConfigor := configor.New(&configor.Config{ENVPrefix: "TWEEKGATEWAY"})
	const settingsFilePath = "./settings/settings.json"
	if _, err := os.Stat(settingsFilePath); !os.IsNotExist(err) {
		if err = tweekConfigor.Load(conf, settingsFilePath); err != nil {
			logrus.WithError(err).Error("Settings error", err)
		}
	} else {
		logrus.WithField("error", err).Panic("Settings file not found:", err)
	}

	// Loading config file if exists
	var configFilePath = conf.ConfigFilePath
	if _, err := os.Stat(configFilePath); !os.IsNotExist(err) {
		if err = tweekConfigor.Load(conf, configFilePath); err != nil {
			logrus.WithError(err).Error("Configuration error")
		}
	} else if _, err := os.Stat("./config/gateway.json"); !os.IsNotExist(err) {
		if err = tweekConfigor.Load(conf, configFilePath); err != nil {
			logrus.WithError(err).Error("Configuration error")
		}
	} else {
		logrus.WithError(err).Error("Config file not found")
	}

	return conf
}

// HandleEnvInlineOrPath returns value of base64 inline environment variable or content of file which path is stored in environmental value
func HandleEnvInlineOrPath(envValue *EnvInlineOrPath) ([]byte, error) {
	var value []byte
	var err error
	if len(envValue.Inline) > 0 {
		value, err = base64.StdEncoding.DecodeString(envValue.Inline)
		if err != nil {
			return nil, err
		}
	} else {
		value, err = ioutil.ReadFile(envValue.Path)
		if err != nil {
			return nil, err
		}
	}
	return value, nil
}

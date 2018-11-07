package appConfig

import (
	"encoding/base64"
	"io/ioutil"
	"log"
	"os"

	"github.com/jinzhu/configor"
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
	KeyPath         bool
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
	RedirectURLs []string `json:"redirect_urls"`
}

// AuthLogin - configuration of login information
type AuthLogin struct {
	LoginType      string                 `json:"login_type"`
	AdditionalInfo map[string]interface{} `json:"additional_info"`
	Scope          string                 `json:"scope"`
	ResponseType   string                 `json:"response_type"`
}

// AuthProvider - configuration of each auth provider
type AuthProvider struct {
	Name      string    `json:"name"`
	Issuer    string    `json:"issuer"`
	Authority string    `json:"authority"`
	ClientID  string    `json:"client_id"`
	JWKSURL   string    `json:"jwks_uri"`
	LoginInfo AuthLogin `json:"login_info"`
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
	Upstreams Upstreams
	V1Hosts   V1Hosts
	V2Routes  []V2Route
	Server    Server
	Security  Security
	Version   string
}

// InitConfig initializes the configuration
func InitConfig() *Configuration {
	conf := &Configuration{}

	tweekConfigor := configor.New(&configor.Config{ENVPrefix: "TWEEKGATEWAY"})

	configFilePath := "/settings/settings.json"
	if _, err := os.Stat(configFilePath); !os.IsNotExist(err) {
		tweekConfigor.Load(conf, configFilePath)
	} else {
		log.Panicln("Config file not found:", err)
	}

	// Loading config file if exists
	configFilePath = "/config/gateway.json"
	if _, err := os.Stat(configFilePath); !os.IsNotExist(err) {
		tweekConfigor.Load(conf, configFilePath)
	} else {
		log.Panicln("Config file not found:", err)
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

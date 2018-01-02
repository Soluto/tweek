package config

import "github.com/spf13/viper"

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
	Port int `mapstructure:"port"`
}

// Security section hold security related configuration
type Security struct {
	AllowedIssuers []string `mapstructure:"allowed_issuers"`
	AzureTenantID  string   `mapstructure:"azure_tenant_id"`
	CasbinPolicy   string   `mapstructure:"casbin_policy"`
	CasbinModel    string   `mapstructure:"casbin_model"`
}

// Configuration is the root element of configuration for secure-gateway
type Configuration struct {
	Upstreams *Upstreams `mapstructure:"upstreams"`
	V1Hosts   *V1Hosts   `mapstructure:"v1Hosts"`
	Server    *Server    `mapstructure:"server"`
	Security  *Security  `mapstructure:"security"`
}

// LoadFromFile the configuration from a file given by fileName
func LoadFromFile(fileName string) *Configuration {
	// setup
	configuration := &Configuration{Upstreams: &Upstreams{}}
	configReader := viper.New()
	configReader.SetConfigFile("gateway.json")
	configReader.SetDefault("server.port", 9090)

	// load
	configReader.ReadInConfig()
	configReader.Unmarshal(configuration)

	// return
	return configuration
}

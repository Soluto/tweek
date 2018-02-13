package corsSupport

import (
	"strconv"
	"strings"

	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
	"github.com/rs/cors"
	"github.com/urfave/negroni"
)

// New creates and configures CORS support middlware
func New(config *appConfig.Cors) negroni.Handler {

	enabled, err := strconv.ParseBool(config.Enabled)
	if err != nil {
		enabled = false
	}
	if !enabled {
		return nil
	}

	maxAge, err := strconv.Atoi(config.MaxAge)
	if err != nil {
		maxAge = 60
	}

	allowCredentials, err := strconv.ParseBool(config.AllowCredentials)
	if err != nil {
		allowCredentials = true
	}

	var allowedOrigins, allowedMethods, allowedHeaders []string
	if len(config.AllowedOrigins) > 0 {
		allowedOrigins = strings.Split(config.AllowedOrigins, ",")
	}

	if len(config.AllowedMethods) > 0 {
		allowedMethods = strings.Split(config.AllowedMethods, ",")
	}

	if len(config.AllowedHeaders) > 0 {
		allowedHeaders = strings.Split(config.AllowedHeaders, ",")
	}

	opts := cors.Options{
		MaxAge:           maxAge,
		AllowedOrigins:   allowedOrigins,
		AllowedHeaders:   allowedHeaders,
		AllowedMethods:   allowedMethods,
		AllowCredentials: allowCredentials,
	}
	corsSupportMiddleware := cors.New(opts)
	return corsSupportMiddleware
}

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

	opts := cors.Options{
		MaxAge:           maxAge,
		AllowedOrigins:   strings.Split(config.AllowedOrigins, ","),
		AllowedHeaders:   strings.Split(config.AllowedHeaders, ","),
		AllowedMethods:   strings.Split(config.AllowedMethods, ","),
		AllowCredentials: allowCredentials,
	}
	corsSupportMiddleware := cors.New(opts)
	return corsSupportMiddleware
}

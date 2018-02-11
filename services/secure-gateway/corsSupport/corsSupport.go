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
	maxAge, err := strconv.Atoi(config.MaxAge)
	if err != nil {
		maxAge = 60
	}

	allowCredentials, err := strconv.ParseBool(config.AllowCredentials)
	if err != nil {
		allowCredentials = true
	}

	corsSupportMiddleware := cors.New(cors.Options{
		MaxAge:           maxAge,
		AllowedOrigins:   strings.Split(config.AllowedOrigins, ","),
		AllowedHeaders:   strings.Split(config.AllowedHeaders, ","),
		AllowedMethods:   strings.Split(config.AllowedMethods, ","),
		AllowCredentials: allowCredentials,
	})
	return corsSupportMiddleware
}

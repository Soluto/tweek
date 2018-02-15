package corsSupport

import (
	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
	"github.com/rs/cors"
	"github.com/urfave/negroni"
)

// New creates and configures CORS support middlware
func New(config *appConfig.Cors) negroni.Handler {

	if !config.Enabled {
		return nil
	}

	return cors.New(cors.Options{
		MaxAge:           config.MaxAge,
		AllowedOrigins:   config.AllowedOrigins,
		AllowedHeaders:   config.AllowedHeaders,
		AllowedMethods:   config.AllowedMethods,
		AllowCredentials: config.AllowCredentials,
	})
}

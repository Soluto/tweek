package corsSupport

import (
	"github.com/rs/cors"
	"github.com/urfave/negroni"
	"tweek-gateway/appConfig"
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
		AllowCredentials: true,
	})
}

package corsSupport

import (
	"github.com/rs/cors"
	"github.com/urfave/negroni"
)

// New creates and configures CORS support middlware
func New() negroni.Handler {
	corsSupportMiddleware := cors.New(cors.Options{})
	return corsSupportMiddleware
}

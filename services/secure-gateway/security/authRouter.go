package security

import (
	"encoding/json"
	"net/http"

	"github.com/Soluto/tweek/services/secure-gateway/appConfig"
	"github.com/gorilla/mux"
	"github.com/urfave/negroni"
)

// MountAuth -
func MountAuth(providers map[string]appConfig.AuthProvider, middleware *negroni.Negroni, router *mux.Router) {
	router.Methods("OPTIONS").Handler(middleware)

	router.Methods("GET").Path("/providers").Handler(middleware.With(getAuthProviders(providers)))
}

func getAuthProviders(providers map[string]appConfig.AuthProvider) negroni.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request, next http.HandlerFunc) {
		js, err := json.Marshal(providers)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(js)
	}
}

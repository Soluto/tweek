package security

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"tweek-gateway/appConfig"
)

// NewUserInfoHandler - returns user name and group for the token in question
func NewUserInfoHandler(configuration *appConfig.Security, extractor SubjectExtractor) http.HandlerFunc {
	return (func(rw http.ResponseWriter, r *http.Request) {
		userInfo, err := userInfoFromRequest(r, configuration, extractor)
		if err != nil {
			http.Error(rw, fmt.Sprintf("Error extracting user info %v", err), http.StatusUnauthorized)
			return
		}

		jsonUserInfo, err := json.Marshal(userInfo.Sub())
		if err != nil {
			log.Panicln("Error serializing user info", err)
		}

		rw.Write(jsonUserInfo)
	})
}

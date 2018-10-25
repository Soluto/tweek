package security

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Soluto/tweek/services/gateway/appConfig"
)

// NewUserInfoHandler - returns user name and group for the token in question
func NewUserInfoHandler(configuration *appConfig.Security, extractor SubjectExtractor) http.HandlerFunc {
	return (func(rw http.ResponseWriter, r *http.Request) {
		userInfo, err := userInfoFromRequest(r, configuration, extractor)
		if err != nil {
			log.Panicln("Error extracting user info", err)
		}

		jsonUserInfo, err := json.Marshal(userInfo.Sub())
		if err != nil {
			log.Panicln("Error serializing user info", err)
		}

		rw.Write(jsonUserInfo)
	})
}

package security

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/sirupsen/logrus"

	"github.com/Soluto/tweek/services/gateway/appConfig"
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
			logrus.WithError(err).Panic("Error serializing user info")
		}

		rw.Write(jsonUserInfo)
	})
}

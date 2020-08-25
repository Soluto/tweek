package security

import (
	"encoding/json"
	"fmt"
	"net/http"
	"tweek-gateway/appConfig"

	"github.com/sirupsen/logrus"
)

// NewUserInfoHandler - returns user name and group for the token in question
func NewUserInfoHandler(configuration *appConfig.Security, extractor SubjectExtractor) http.HandlerFunc {
	return (func(rw http.ResponseWriter, r *http.Request) {
		userInfo, err := userInfoFromRequest(r, configuration, extractor)
		if err != nil {
			http.Error(rw, fmt.Sprintf("Error extracting user info %v", err), http.StatusUnauthorized)
			return
		}

		jsonUserInfo, err := json.Marshal(map[string]interface{}{
			"User":  userInfo.Sub().User,
			"Group": userInfo.Sub().Group,
			"Email": userInfo.Email(),
			"Name":  userInfo.Name(),
		})

		if err != nil {
			logrus.WithError(err).Panic("Error serializing user info")
		}

		rw.Write(jsonUserInfo)
	})
}

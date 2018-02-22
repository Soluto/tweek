package monitoring

import (
	"fmt"
	"net/http"
)

// IsAlive always returns true
func IsAlive(w http.ResponseWriter, r *http.Request) {
	fmt.Fprint(w, "true")
}

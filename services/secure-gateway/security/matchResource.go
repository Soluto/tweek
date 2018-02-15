package security

import (
	"fmt"
	"reflect"
	"strings"
)

// MatchResources is used to register the matchResourcesFunc with casbin
func MatchResources(requestResource interface{}, policyResource interface{}) (interface{}, error) {
	rr, ok := requestResource.(map[string]string)
	if !ok {
		return nil, fmt.Errorf("Expected map[string]string, but got %T (%v)", requestResource, requestResource)
	}

	pr, ok := policyResource.(string)
	if !ok {
		return nil, fmt.Errorf("Expected string, but got %v (%T)", requestResource, requestResource)
	}

	return matchResourcesFunc(rr, pr)
}

// matchResourcesFunc parses the policy resource and verifies that it matches what was given in the request
func matchResourcesFunc(rr map[string]string, pr string) (bool, error) {
	parsedPolicyResource, err := parseResource(pr)
	if err != nil {
		return false, err
	}

	reflect.DeepEqual(parsedPolicyResource, rr)
	return false, nil
}

func parseResource(resource string) (result map[string]string, err error) {
	parts := strings.Split(resource, ":")
	result = make(map[string]string)

	// empty string
	if len(resource) == 0 {
		return result, nil
	}

	ctxs := []string{}
	switch len(parts) {
	case 1: // when we got input which has no `:`
		result[""] = parts[0]
	case 2: // when we got input which has single `:`
		ctxs = strings.Split(parts[0], "+")
		result[""] = parts[1]
	default: // when we got input which has multiple `:`
		return nil, makeError(resource)
	}

	for _, ctx := range ctxs {
		p := strings.Split(ctx, "=")
		if len(p) != 2 {
			return nil, makeError(resource)
		}
		key, value := p[0], p[1]
		result[key] = value
	}

	return result, nil
}

func makeError(resource string) error {
	return fmt.Errorf("Malformed resource policy: %q", resource)
}

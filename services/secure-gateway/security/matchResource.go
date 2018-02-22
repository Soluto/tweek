package security

import (
	"fmt"
	"strings"
)

// MatchResources is used as a wrapper for matchResourcesFunc for casbin registration
func MatchResources(args ...interface{}) (interface{}, error) {
	requestResource := args[0]
	policyResource := args[1]
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

// matchResourcesFunc parses the policy resource (pr) and verifies that it matches what was given in the request (rr)
func matchResourcesFunc(rr map[string]string, pr string) (bool, error) {
	parsedKeyOrProp, parsedPolicyResource, err := parseResource(pr)
	if err != nil {
		return false, err
	}

	if (len(parsedPolicyResource) == len(rr)) && (len(rr) == 0) {
		return true, nil
	}

	if len(parsedPolicyResource)+1 != len(rr) {
		return false, nil
	}

	if !matchWithWildcards(parsedKeyOrProp, rr[KeyOrProperty]) {
		return false, nil
	}

	for key, value := range parsedPolicyResource {
		resourcePart, ok := rr[key]
		if !ok { // some keys are missing from the request - no match
			return false, nil
		}
		if value != "*" && value != resourcePart {
			return false, nil
		}
	}

	return true, nil
}

func matchWithWildcards(pattern, input string) bool {
	// any
	if pattern == "*" {
		return true
	}

	// prefix
	if strings.HasSuffix(pattern, "*") {
		return strings.HasPrefix(input, pattern[0:len(pattern)-2])
	}

	// no wildcards
	return pattern == input
}

func parseResource(resource string) (keyOrProp string, result map[string]string, err error) {
	// split by `:`
	parts := strings.Split(resource, ":")
	result = make(map[string]string)

	// empty string
	if len(resource) == 0 {
		return "", result, nil
	}

	ctxs := []string{}
	switch len(parts) {
	case 1: // when we got input which has no `:`
		keyOrProp = parts[0]
	case 2: // when we got input which has single `:`
		if parts[1] == "" {
			return "", nil, makeError(resource)
		}
		ctxs = strings.Split(parts[0], "+")
		keyOrProp = parts[1]
	default: // when we got input which has multiple `:`
		return "", nil, makeError(resource)
	}

	for _, ctx := range ctxs {
		p := strings.Split(ctx, "=")
		if len(p) != 2 {
			return "", nil, makeError(resource)
		}
		key, value := p[0], p[1]
		result[key] = value
	}

	return keyOrProp, result, nil
}

func makeError(resource string) error {
	return fmt.Errorf("Malformed resource policy: %q", resource)
}

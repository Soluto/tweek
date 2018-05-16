package security

import (
	"fmt"
	"strings"
)

// PolicyResource describes the resource and contexts allowed for this resource
type PolicyResource struct {
	Contexts map[string]string
	Item     string
}

// MatchResources is used as a wrapper for matchResourcesFunc for casbin registration
func MatchResources(args ...interface{}) (interface{}, error) {
	requestResource := args[0]
	policyResource := args[1]
	rr, ok := requestResource.(PolicyResource)
	if !ok {
		return nil, fmt.Errorf("Expected PolicyResource, but got %T (%v)", requestResource, requestResource)
	}

	pr, ok := policyResource.(string)
	if !ok {
		return nil, fmt.Errorf("Expected string, but got %v (%T)", requestResource, requestResource)
	}

	return matchResourcesFunc(rr, pr)
}

// matchResourcesFunc parses the policy resource (pr) and verifies that it matches what was given in the request (rr)
func matchResourcesFunc(rr PolicyResource, pr string) (bool, error) {
	parsedPolicyResource, err := parseResource(pr)
	if err != nil {
		return false, err
	}

	if len(parsedPolicyResource.Contexts) != len(rr.Contexts) {
		return false, nil
	}

	if !matchWithWildcards(parsedPolicyResource.Item, rr.Item) {
		return false, nil
	}

	for key, value := range parsedPolicyResource.Contexts {
		resourcePart, ok := rr.Contexts[key]
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
	result := pattern == input
	return result
}

func parseResource(resource string) (result PolicyResource, err error) {
	// split by `:`
	parts := strings.Split(resource, ":")
	result = PolicyResource{Contexts: map[string]string{}}

	// empty string
	if len(resource) == 0 {
		return result, makeError(resource)
	}

	ctxs := []string{}
	switch len(parts) {
	case 1: // when we got input which has no `:`
		result.Item = parts[0]
	case 2: // when we got input which has single `:`
		if parts[1] == "" {
			return result, makeError(resource)
		}
		ctxs = strings.Split(parts[0], "+")
		result.Item = parts[1]
	default: // when we got input which has multiple `:`
		return result, makeError(resource)
	}

	for _, ctx := range ctxs {
		p := strings.Split(ctx, "=")
		if len(p) != 2 {
			return result, makeError(resource)
		}
		key, value := p[0], p[1]
		result.Contexts[key] = value
	}

	return result, nil
}

func makeError(resource string) error {
	return fmt.Errorf("Malformed resource policy: %q", resource)
}

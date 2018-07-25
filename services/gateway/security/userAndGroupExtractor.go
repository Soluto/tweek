package security

import (
	"context"
	"fmt"
	"log"
	"sync"

	"github.com/dgrijalva/jwt-go"
	"github.com/open-policy-agent/opa/ast"
	"github.com/open-policy-agent/opa/rego"
)

// UserAndGroupExtractor represents an interface used to extract user and group
type UserAndGroupExtractor interface {
	ExtractUserAndGroup(ctx context.Context, claims jwt.MapClaims) (string, error)
}

// DefaultUserAndGroupExtractor is the default implementation of DefaultUserAndGroupExtractor
type DefaultUserAndGroupExtractor struct {
	partialResult *rego.PartialResult
}

// SynchronizedUserAndGroupExtractor is the synchronized implementation of extractor
type SynchronizedUserAndGroupExtractor struct {
	extractor UserAndGroupExtractor
	lock      sync.RWMutex
}

// NewDefaultUserAndGroupExtractor is a constructor for DefaultUserAndGroupExtractor
func NewDefaultUserAndGroupExtractor(rules, pkg, query string) *DefaultUserAndGroupExtractor {
	c := ast.NewCompiler()
	module, err := ast.ParseModule("rules.rego", rules)
	if err != nil {
		log.Panicln("Error parsing rules", err)
	}
	c.Compile(map[string]*ast.Module{
		"rules.rego": module,
	})
	if c.Failed() {
		log.Panicln("Error compiling rules", c.Errors)
	}

	rego := rego.New(
		rego.Query(query),
		rego.Package(pkg),
		rego.Compiler(c),
	)

	partial, err := rego.PartialEval(context.Background())
	if err != nil {
		log.Panicln("Error loading Rego", err)
	}

	return &DefaultUserAndGroupExtractor{
		partialResult: &partial,
	}
}

// ExtractUserAndGroup extracts user and group from JWT claims in the form of `group:user`
func (e *DefaultUserAndGroupExtractor) ExtractUserAndGroup(ctx context.Context, claims jwt.MapClaims) (string, error) {
	rego := e.partialResult.Rego(
		rego.Input(claims),
	)
	result, err := rego.Eval(ctx)
	if err != nil {
		return "", err
	}
	if len(result) != 1 {
		return "", fmt.Errorf("Expected rego to produce exactly 1 result, but got %d", len(result))
	}

	value := result[0].Expressions[0].Value.(map[string]interface{})

	group, ok := value["group"]
	if !ok {
		return "", fmt.Errorf("Expected rego rules to produce group, but got %v", value)
	}
	user, ok := value["user"]
	if !ok {
		return "", fmt.Errorf("Expected rego rules to produce user, but got %v", value)
	}
	if group == nil || user == nil {
		return "", fmt.Errorf("Expected rego rules to produce non nil user and group, but got")
	}

	return fmt.Sprintf("%s:%s", group, user), nil
}

// NewSynchronizedUserAndGroupExtractor creates new synchronized user and group extractor
func NewSynchronizedUserAndGroupExtractor(extractor UserAndGroupExtractor) *SynchronizedUserAndGroupExtractor {
	return &SynchronizedUserAndGroupExtractor{
		extractor: extractor,
	}
}

// ExtractUserAndGroup implements extraction for SynchronizedUserAndGroupExtractor
func (se *SynchronizedUserAndGroupExtractor) ExtractUserAndGroup(ctx context.Context, claims jwt.MapClaims) (string, error) {
	se.lock.RLock()
	defer se.lock.RUnlock()
	return se.extractor.ExtractUserAndGroup(ctx, claims)
}

// UpdateExtractor updates the extractor used in SynchronizedUserAndGroupExtractor
func (se *SynchronizedUserAndGroupExtractor) UpdateExtractor(extractor UserAndGroupExtractor) {
	se.lock.Lock()
	defer se.lock.Unlock()
	se.extractor = extractor
}

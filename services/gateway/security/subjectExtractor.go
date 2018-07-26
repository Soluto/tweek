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

// SubjectExtractor represents an interface used to extract user and group
type SubjectExtractor interface {
	ExtractSubject(ctx context.Context, claims jwt.MapClaims) (string, error)
}

// DefaultSubjectExtractor is the default implementation of DefaultSubjectExtractor
type DefaultSubjectExtractor struct {
	partialResult *rego.PartialResult
}

// SynchronizedSubjectExtractor is the synchronized implementation of extractor
type SynchronizedSubjectExtractor struct {
	extractor SubjectExtractor
	lock      sync.RWMutex
}

// NewDefaultSubjectExtractor is a constructor for DefaultSubjectExtractor
func NewDefaultSubjectExtractor(rules, pkg, query string) *DefaultSubjectExtractor {
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

	return &DefaultSubjectExtractor{
		partialResult: &partial,
	}
}

// ExtractSubject extracts user and group from JWT claims in the form of `group:user`
func (e *DefaultSubjectExtractor) ExtractSubject(ctx context.Context, claims jwt.MapClaims) (string, error) {
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

// NewSynchronizedSubjectExtractor creates new synchronized user and group extractor
func NewSynchronizedSubjectExtractor(extractor SubjectExtractor) *SynchronizedSubjectExtractor {
	return &SynchronizedSubjectExtractor{
		extractor: extractor,
	}
}

// ExtractSubject implements extraction for SynchronizedSubjectExtractor
func (se *SynchronizedSubjectExtractor) ExtractSubject(ctx context.Context, claims jwt.MapClaims) (string, error) {
	se.lock.RLock()
	defer se.lock.RUnlock()
	return se.extractor.ExtractSubject(ctx, claims)
}

// UpdateExtractor updates the extractor used in SynchronizedSubjectExtractor
func (se *SynchronizedSubjectExtractor) UpdateExtractor(extractor SubjectExtractor) {
	se.lock.Lock()
	defer se.lock.Unlock()
	se.extractor = extractor
}

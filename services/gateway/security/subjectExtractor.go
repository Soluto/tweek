package security

import (
	"context"
	"fmt"
	"sync"

	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/open-policy-agent/opa/ast"
	"github.com/open-policy-agent/opa/rego"
	"github.com/sirupsen/logrus"
)

// SubjectExtractor represents an interface used to extract user and group
type SubjectExtractor interface {
	ExtractSubject(ctx context.Context, claims jwt.MapClaims) (*Subject, error)
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
	module, err := ast.ParseModule("subject_extraction_rules.rego", rules)
	if err != nil {
		logrus.WithError(err).Panic("Error parsing rules")
	}
	c.Compile(map[string]*ast.Module{
		"subject_extraction_rules.rego": module,
	})
	if c.Failed() {
		logrus.WithField("errors", c.Errors).Panic("Error compiling rules")
	}

	rego := rego.New(
		rego.Query(query),
		rego.Package(pkg),
		rego.Compiler(c),
	)

	partial, err := rego.PartialEval(context.Background())
	if err != nil {
		logrus.WithError(err).Panic("Error loading Rego")
	}

	return &DefaultSubjectExtractor{
		partialResult: &partial,
	}
}

// ExtractSubject extracts user and group from JWT claims in the form of `group:user`
func (e *DefaultSubjectExtractor) ExtractSubject(ctx context.Context, claims jwt.MapClaims) (*Subject, error) {
	rego := e.partialResult.Rego(
		rego.Input(claims),
	)
	result, err := rego.Eval(ctx)
	if err != nil {
		return &Subject{}, err
	}
	if len(result) != 1 {
		return &Subject{}, fmt.Errorf("Expected rego to produce exactly 1 result, but got %d", len(result))
	}

	value := result[0].Expressions[0].Value.(map[string]interface{})

	group, ok := value["group"]
	if !ok {
		return &Subject{}, fmt.Errorf("Expected rego rules to produce group, but got %v", value)
	}
	user, ok := value["user"]
	if !ok {
		return &Subject{}, fmt.Errorf("Expected rego rules to produce user, but got %v", value)
	}
	if group == nil || user == nil {
		return &Subject{}, fmt.Errorf("Expected rego rules to produce non nil user and group")
	}

	return &Subject{User: user.(string), Group: group.(string)}, nil
}

// NewSynchronizedSubjectExtractor creates new synchronized user and group extractor
func NewSynchronizedSubjectExtractor(extractor SubjectExtractor) *SynchronizedSubjectExtractor {
	return &SynchronizedSubjectExtractor{
		extractor: extractor,
	}
}

// ExtractSubject implements extraction for SynchronizedSubjectExtractor
func (se *SynchronizedSubjectExtractor) ExtractSubject(ctx context.Context, claims jwt.MapClaims) (*Subject, error) {
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

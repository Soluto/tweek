package security

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"

	"github.com/open-policy-agent/opa/storage/inmem"

	"github.com/open-policy-agent/opa/ast"
	"github.com/open-policy-agent/opa/rego"
)

// Authorizer is the interface which allows authorization
type Authorizer interface {
	Authorize(ctx context.Context, subject *Subject, object PolicyResource, action string) (bool, error)
}

// DefaultAuthorizer is the default implementation of Authorizer
type DefaultAuthorizer struct {
	partialResult *rego.PartialResult
}

// NewDefaultAuthorizer is the constructor for DefaultAuthorizer
func NewDefaultAuthorizer(rules, data, pkg, query string) *DefaultAuthorizer {
	c := ast.NewCompiler()
	module, err := ast.ParseModule("subject_extraction_rules.rego", rules)
	if err != nil {
		log.Panicln("Error parsing rules", err)
	}
	c.Compile(map[string]*ast.Module{
		"subject_extraction_rules.rego": module,
	})
	if c.Failed() {
		log.Panicln("Error compiling rules", c.Errors)
	}

	var actualData map[string]interface{}
	err = json.Unmarshal([]byte(data), &actualData)
	if err != nil {
		log.Panicln("Error deserializing JSON data", c.Errors)
	}

	dataStore := inmem.NewFromObject(actualData)

	rego := rego.New(
		rego.Query(query),
		rego.Package(pkg),
		rego.Compiler(c),
		rego.Store(dataStore),
	)

	partial, err := rego.PartialEval(context.Background())
	if err != nil {
		log.Panicln("Error loading Rego", err)
	}

	return &DefaultAuthorizer{
		partialResult: &partial,
	}
}

// Authorize implements authorization for DefaultAuthorizer
func (d *DefaultAuthorizer) Authorize(ctx context.Context, subject *Subject, object PolicyResource, action string) (bool, error) {
	input := map[string]interface{}{
		"group":    subject.Group,
		"user":     subject.User,
		"object":   object.Item,
		"contexts": object.Contexts,
		"action":   action,
	}

	evaluator := d.partialResult.Rego(rego.Input(input))

	result, err := evaluator.Eval(ctx)

	if err != nil {
		return false, err
	}

	if len(result) != 1 {
		return false, fmt.Errorf("Expected rego to produce exactly 1 result, but got %d", len(result))
	}

	authorized := result[0].Expressions[0].Value.(bool)

	return authorized, nil
}

// SynchronizedAuthorizer is the default implementation of Authorizer
type SynchronizedAuthorizer struct {
	authorizer Authorizer
	lock       sync.RWMutex
}

// NewSynchronizedAuthorizer creates a synchronized authorizer
func NewSynchronizedAuthorizer(a Authorizer) *SynchronizedAuthorizer {
	return &SynchronizedAuthorizer{
		authorizer: a,
	}
}

// Authorize - synchronized version
func (s *SynchronizedAuthorizer) Authorize(ctx context.Context, subject *Subject, object PolicyResource, action string) (bool, error) {
	s.lock.RLock()
	defer s.lock.RUnlock()
	return s.authorizer.Authorize(ctx, subject, object, action)
}

// Update is used to update the underlying authorizer
func (s *SynchronizedAuthorizer) Update(a Authorizer) {
	s.lock.Lock()
	defer s.lock.Unlock()
	s.authorizer = a
	log.Println("Authorization policy was refreshed")
}

package audit

import (
	"fmt"
	"io"
	"log"
)

// Format strings
const (
	actionAuditFmt = "subj:%v obj:%v act:%v eff:%v"
)

type logAuditor struct {
	log *log.Logger
}

// New creates a new Auditor, which logs to io.Writer, with prefix 'AUDIT'
func New(out io.Writer) (Auditor, error) {
	return NewLogger(log.New(out, "AUDIT", log.LstdFlags|log.LUTC))
}

// NewLogger creates a new logger based Auditor
func NewLogger(logger *log.Logger) (Auditor, error) {
	return &logAuditor{log: logger}, nil
}

func (a *logAuditor) Allowed(subject, object, action string) {
	a.log.Printf(actionAuditFmt, subject, object, action, "ACCESS ALLOWED")
}

func (a *logAuditor) Denied(subject, object, action string) {
	a.log.Printf(actionAuditFmt, subject, object, action, "ACCESS DENIED")
}

func (a *logAuditor) EnforcerError(subject, object, action string, err error) {
	a.log.Printf(actionAuditFmt, subject, object, action, fmt.Sprintf("ERROR: %v", err))
}

func (a *logAuditor) TokenError(err error) {
	a.log.Printf("TOKEN ERROR: %q", err)
}

func (a *logAuditor) EnforcerEnabled() {
	a.log.Printf("ENFORCER ENABLED")
}

func (a *logAuditor) EnforcerDisabled() {
	a.log.Printf("ENFORCER DISABLED")
}

func (a *logAuditor) RunningInTestMode() {
	a.log.Printf("RUNNING IN TEST MODE")
}

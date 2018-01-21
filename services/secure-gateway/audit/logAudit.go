package audit

import (
	"fmt"
	"io"
	"log"
)

// Format strings
const (
	actionAuditFmt = "%v : %q %q %q"
)

type logAudit struct {
	log *log.Logger
}

// New creates a new Auditor, which logs to io.Writer, with prefix 'AUDIT'
func New(out io.Writer) (Auditor, error) {
	return NewLog(log.New(out, "AUDIT", log.LstdFlags|log.LUTC))
}

// NewLog creates a new logger based Auditor
func NewLog(logger *log.Logger) (Auditor, error) {
	return &logAudit{log: logger}, nil
}

func (a *logAudit) Allowed(subject, object, action string) {
	a.log.Printf(actionAuditFmt, subject, object, action, "ACCESS ALLOWED")
}

func (a *logAudit) Denied(subject, object, action string) {
	a.log.Printf(actionAuditFmt, subject, object, action, "ACCESS DENIED")
}

func (a *logAudit) EnforcerError(subject, object, action string, err error) {
	a.log.Printf(actionAuditFmt, subject, object, action, fmt.Sprintf("ERROR: %v", err))
}

func (a *logAudit) TokenError(err error) {
	a.log.Printf("TOKEN ERROR: %q", err)
}

func (a *logAudit) EnforcerEnabled() {
	a.log.Printf("ENFORCER ENABLED")
}

func (a *logAudit) EnforcerDisabled() {
	a.log.Printf("ENFORCER DISABLED")
}

func (a *logAudit) RunningInTestMode() {
	a.log.Printf("RUNNING IN TEST MODE")
}

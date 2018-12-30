package audit

import (
	"io"

	"github.com/sirupsen/logrus"
)

type logAuditor struct {
	log *logrus.Entry
}

// New creates a new Auditor, which logs to io.Writer, with prefix 'AUDIT'
func New(out io.Writer) (Auditor, error) {
	return NewLogger(logrus.WithField("type", "AUDIT"))
}

// NewLogger creates a new logger based Auditor
func NewLogger(logger *logrus.Entry) (Auditor, error) {
	return &logAuditor{log: logger}, nil
}

func (a *logAuditor) Allowed(subject, object, action string) {
	a.log.WithFields(logrus.Fields{"subject": subject, "object": object, "action": action}).Info("ACCESS ALLOWED")
}

func (a *logAuditor) Denied(subject, object, action string) {
	a.log.WithFields(logrus.Fields{"subject": subject, "object": object, "action": action}).Info("ACCESS DENIED")
}

func (a *logAuditor) AuthorizerError(subject, object, action string, err error) {
	a.log.WithFields(logrus.Fields{"subject": subject, "object": object, "action": action}).WithError(err).Error("ERROR")
}

func (a *logAuditor) TokenError(err error) {
	a.log.WithError(err).Error("TOKEN ERROR")
}

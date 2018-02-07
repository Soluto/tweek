package audit

// Auditor is the interface which defines auditing
type Auditor interface {
	// Allowed sends indication that the action was allowed
	Allowed(subject, object, action string)
	// Denied sends indication that the action was denied
	Denied(subject, object, action string)
	// EnforcerError sends indication that the authorization failed for technical reasons
	EnforcerError(subject, object, action string, err error)
	// TokenError sends indication that user supplied invalid token
	TokenError(err error)
	// RunningInTestMode sends indication that the server was started in test mode
	RunningInTestMode()
	// EnforcerEnabled sends indication that the enforcer was enabled
	EnforcerEnabled()
	// EnforcerDisabled sends indication that the enforcer was disabled
	EnforcerDisabled()
}

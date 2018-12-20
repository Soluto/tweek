using System;

namespace Tweek.Publishing.Service.Validation
{
    public class SubjectExtractionRulesValidationException : Exception
    {
        public SubjectExtractionRulesValidationException(Exception originalException) : base("subject extraction Open Policy Agent rules are invalid")
        {
            this.Data["Original Exception"] = originalException;
        }
    }
}
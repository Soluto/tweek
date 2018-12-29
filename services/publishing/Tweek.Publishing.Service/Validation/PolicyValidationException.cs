using System;

namespace Tweek.Publishing.Service.Validation
{
    public class PolicyValidationException : Exception
    {
        public PolicyValidationException(Exception originalException) : base("policy is invalid")
        {
            this.Data["Original Exception"] = originalException;
        }
    }
}
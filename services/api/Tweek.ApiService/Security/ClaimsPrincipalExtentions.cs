using LanguageExt;
using System.Security.Claims;

namespace Tweek.ApiService.Security
{
    public static class ClaimsPrincipalExtentions
    {
        public static bool IsTweekIdentity(this ClaimsPrincipal identity)
        {
            return Prelude.Optional(identity.FindFirst("iss")).Match(c => c.Value.Equals("tweek"), () => false);
        }
    }
}

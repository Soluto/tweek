using System.Security.Claims;
using static LanguageExt.Prelude;

namespace Tweek.ApiService.NetCore.Security
{
    public static class ClaimsPrincipalExtentions
    {
        public static bool IsTweekIdentity(this ClaimsPrincipal identity)
        {
            return Optional(identity.FindFirst("iss")).Match(c => c.Value.Equals("tweek"), () => false);
        }
    }
}

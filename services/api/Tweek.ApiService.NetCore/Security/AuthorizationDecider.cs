using Engine.Core.Context;
using Engine.DataTypes;
using FSharpUtils.Newtonsoft;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Tweek.Engine;
using Tweek.Engine.Context;
using static LanguageExt.Prelude;

namespace Tweek.ApiService.NetCore.Security
{
    public delegate bool CheckReadConfigurationAccess(ClaimsPrincipal identity, string path, ICollection<Identity> tweekIdentities);
    public delegate bool CheckWriteContextAccess(ClaimsPrincipal identity, Identity tweekIdentity);
    
    public static class Authorization
    {
        public static CheckReadConfigurationAccess CreateReadConfigurationAccessChecker(ITweek tweek, TweekIdentityProvider identityProvider)
        {
            return (identity, path, tweekIdentities) =>
            {
                if (path == "@tweek/_" || path.StartsWith("@tweek/auth")) return false;

                return tweekIdentities
                    .Select(x => x.ToAuthIdentity(identityProvider))
                    .Distinct()
                    .DefaultIfEmpty(Identity.GlobalIdentity)
                    .All(tweekIdentity => CheckAuthenticationForKey(tweek, "read_configuration", identity, tweekIdentity));
            };
        }

        public static bool CheckAuthenticationForKey(ITweek tweek, string permissionType, ClaimsPrincipal identity, Identity tweekIdentity)
        {
            var identityType = tweekIdentity.Type;
            var key = $"@tweek/auth/{identityType}/{permissionType}";

            return identity.IsTweekIdentity() ||
                tweek.Calculate(key, new HashSet<Identity>(),
                        type => type == "token" ? (GetContextValue)(q => Optional(identity.FindFirst(q)).Map(x=>x.Value).Map(JsonValue.NewString)) : _ => None)
                        .SingleKey(key)
                        .Map(j => j.AsString())
                        .Match(x => match(x, 
                                with("allow", _ => true),
                                with("deny", _ => false),
                                claim => Optional(identity.FindFirst(claim)).Match(c=> c.Value.Equals(tweekIdentity.Id,StringComparison.OrdinalIgnoreCase), ()=>false)), () => true);
        }

        public static CheckWriteContextAccess CreateWriteContextAccessChecker(ITweek tweek, TweekIdentityProvider identityProvider)
        {
            return (identity, tweekIdentity) => CheckAuthenticationForKey(tweek, "write_context", identity, tweekIdentity.ToAuthIdentity(identityProvider));
        }
    }
}

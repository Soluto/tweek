using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System;
using Engine;
using Engine.Core.Context;
using Engine.DataTypes;
using FSharpUtils.Newtonsoft;
using LanguageExt.Trans;
using LanguageExt.SomeHelp;
using LanguageExt.Trans.Linq;
using LanguageExt;
using static LanguageExt.Prelude;

namespace Tweek.ApiService.NetCore.Security
{
    public delegate bool CheckReadConfigurationAccess(ClaimsPrincipal identity, string path, ICollection<Identity> tweekIdentities);
    public delegate bool CheckWriteContextAccess(ClaimsPrincipal identity, Identity tweekIdentity);
    
    public static class Authorization
    {
        public static CheckReadConfigurationAccess CreateReadConfigurationAccessChecker(ITweek tweek)
        {
            return (identity, path, tweekIdentities) =>
            {
                if (path == "@tweek/_" || path.StartsWith("@tweek/auth")) return false;
                return tweekIdentities
                .Select(tweekIdentity => CheckAuthenticationForKey(tweek, "read_configuration", identity, tweekIdentity))
                .All(x => x);
            };
        }

        public static bool CheckAuthenticationForKey(ITweek tweek, string permissionType, ClaimsPrincipal identity, Identity tweekIdentity){
            var identityType = tweekIdentity.Type;
            var key = $"@tweek/auth/{identityType}/{permissionType}";

            return tweek.CalculateWithLocalContext(key, new HashSet<Identity>(),
                        type => type == "token" ? (GetContextValue)((string q) => Optional(identity.FindFirst(q)).Map(x=>x.Value).Map(JsonValue.NewString)) : (_) => None)
                        .SingleKey(key)
                        .Map(j => j.AsString())
                        .Match(x => match(x, 
                                with("allow", (_) => true),
                                with("deny", (_) => false),
                                (claim) => Optional(identity.FindFirst(claim)).Match(c=> c.Value.Equals(tweekIdentity.Id,StringComparison.OrdinalIgnoreCase), ()=>false)), () => true);
        }

        public static CheckWriteContextAccess CreateWriteContextAccessChecker(ITweek tweek)
        {
            return (identity, tweekIdentity) => CheckAuthenticationForKey(tweek, "write_context", identity, tweekIdentity);
        }
    }
}

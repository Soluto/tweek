using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
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
    
    public static class Authorization
    {
        public static CheckReadConfigurationAccess CreateAccessChecker(ITweek tweek)
        {
            return (identity, path, tweekIdentities) =>
            {
                if (path.StartsWith("@tweek")) return false;
                return tweekIdentities.Select(tweekIdentity =>
                {
                    var identityType = tweekIdentity.Type;
                    var key = $"@tweek/auth/{identityType}/read_configuration";
                    var result = tweek.CalculateWithLocalContext(key, new HashSet<Identity>(),
                        type => type == "token" ? (GetContextValue)((string q) => Optional(identity.FindFirst(q)).Map(x=>x.Value).Map(JsonValue.NewString)) : (_) => None)
                        .SingleKey(key)
                        .Map(j => j.AsString())
                        .Match(x => match(x, 
                                with("allow", (_) => true),
                                with("deny", (_) => false),
                                (claim) => Optional(identity.FindFirst(claim)).Match(c=> c.Value == tweekIdentity.Id, ()=>false)), () => true);

                    return result;
                }).All(x => x);
            };
        }
    }
}

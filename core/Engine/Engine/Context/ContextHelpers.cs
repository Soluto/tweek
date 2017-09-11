using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Threading.Tasks;
using Engine.Core.Context;
using Engine.Core.Utils;
using Engine.DataTypes;
using FSharpUtils.Newtonsoft;
using LanguageExt;
using static LanguageExt.Prelude;
using IdentityHashSet = System.Collections.Generic.HashSet<Engine.DataTypes.Identity>;

namespace Engine.Context
{
    public delegate Task<GetContextValue> GetContextByIdentity(Identity identity);

    public static class ContextHelpers
    {
        public static readonly GetContextValue EmptyContext = key => None;
        public static readonly GetLoadedContextByIdentityType EmptyContextByIdentityType =  identity => key => None;

        public static GetLoadedContextByIdentityType Fallback(params GetLoadedContextByIdentityType[] list)
        {
            return list.Reduce((l,r)=> identityType => key => l(identityType)(key).IfNone(()=>r(identityType)(key)));
        }

        public static GetLoadedContextByIdentityType AddSystemContext(GetLoadedContextByIdentityType context)
        {
            var timeUtc = Option<JsonValue>.Some(JsonValue.NewString(DateTime.UtcNow.ToString("u")));

            return Fallback(context, type =>
            {
                if (type.Equals("system", StringComparison.CurrentCultureIgnoreCase))
                    return (key =>
                    {
                        switch (key)
                        {
                            case "time_utc":
                                return timeUtc;
                            default:
                                return Option<JsonValue>.None;
                        }
                    });

                return (key => Option<JsonValue>.None);
            });
        }

        internal static GetContextValue ContextValueForId(string id)
        {
            return key => key == "@@id" ? JsonValue.NewString(id) : Option<JsonValue>.None;
        }

        internal static GetLoadedContextByIdentityType GetContextRetrieverByType(GetLoadedContextByIdentity getLoadedContexts, IdentityHashSet identities)
        {
            return type =>
            {
                return
                    identities.Where(x => x.Type.Equals(type, StringComparison.OrdinalIgnoreCase))
                        .FirstOrNone()
                        .Map(identity => Core.Context.ContextHelpers.Merge(getLoadedContexts(identity), ContextValueForId(identity.Id)))
                        .IfNone(EmptyContext);
            };
        }

        internal static  GetLoadedContextByIdentity LoadContexts(Dictionary<Identity, Dictionary<string,JsonValue>> loadContextData)
        {   
            return (Identity identity) => (key)=>
            {
                return ((IReadOnlyDictionary<Identity,Dictionary<string, JsonValue>>)loadContextData)
                    .TryGetValue(identity)
                    .Bind(x => ((IReadOnlyDictionary<string, JsonValue>)x).TryGetValue(key));
                
            };
        }

        internal static GetLoadedContextByIdentityType Memoize(GetLoadedContextByIdentityType c)
        {
            var list = new Dictionary<string, GetContextValue>();
            return (t) =>
            {
                if (!list.ContainsKey(t))
                {
                    list[t] = Core.Context.ContextHelpers.Memoize(c(t));
                }
                return list[t];
            };
        }

        public static bool IsIdentityDefinedWithAuth(this Identity identity, TweekIdentityProvider identityProvider)
        {
            var identitiesWithAuth = identityProvider.GetIdentitiesWithAuth();
            return identitiesWithAuth.Contains(identity.Type);
        }

        public static Identity ToAuthIdentity(this Identity identity, TweekIdentityProvider identityProvider)
        {
            return identity.IsIdentityDefinedWithAuth(identityProvider) ? identity : Identity.GlobalIdentity;
        }
    }
}

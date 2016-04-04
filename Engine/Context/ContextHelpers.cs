using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.Core.Context;
using Engine.Core.Utils;
using Engine.DataTypes;
using LanguageExt;
using static LanguageExt.Prelude;

namespace Engine.Context
{
    public delegate Task<GetContextValue> GetContextByIdentity(Identity identity);

    public static class ContextHelpers
    {
        public static readonly GetContextValue EmptyContext = key => Option<string>.None;
        public static readonly GetLoadedContextByIdentityType EmptyContextByIdentityType =  identity => key => Option<string>.None;

        public static GetLoadedContextByIdentityType Fallback(params GetLoadedContextByIdentityType[] list)
        {
            return list.Reduce((l,r)=> identityType => key => l(identityType)(key).IfNone(()=>r(identityType)(key)));
        }

        internal static GetContextValue ContextValueForId(string id)
        {
            return key => key == "@@id" ? id : Option<string>.None;
        }

        internal static GetLoadedContextByIdentityType GetContextRetrieverByType(GetLoadedContextByIdentity getLoadedContexts, HashSet<Identity> identities)
        {
            return type =>
            {
                return
                    identities.Where(x => x.Type == type)
                        .FirstOrNone()
                        .Map(identity => Core.Context.ContextHelpers.Merge(getLoadedContexts(identity), ContextValueForId(identity.Id)))
                        .IfNone(EmptyContext);
            };
        }

        internal static  GetLoadedContextByIdentity LoadContexts(Dictionary<Identity, Dictionary<string,string>> loadContextData)
        {   
            return (Identity identity) => (key)=>
            {
                return ((IReadOnlyDictionary<Identity,Dictionary<string,string>>)loadContextData)
                    .TryGetValue(identity)
                    .Bind(x => ((IReadOnlyDictionary<string,string>)x).TryGetValue(key));
                
            };
        }


    }
}
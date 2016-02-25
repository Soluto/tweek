using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.Context;
using LanguageExt;

namespace Engine
{
    public static class ContextHelpers
    {
        internal static GetLoadedContextByIdentityType GetContextRetrieverByType(GetLoadedContextByIdentity getLoadedContexts, HashSet<Identity> identities)
        {
            return (string type) =>
            {
                return getLoadedContexts(identities.Single(x => x.Type == type));
            };
        }

        internal static async Task<GetLoadedContextByIdentity> LoadContexts(HashSet<Identity> identities, GetContextByIdentity byId)
        {
            var contexts = await Task.WhenAll(identities.Select(async x => new {Identity=x, Context = await byId(x) }));
            return (Identity identity) =>
            {
                return contexts
                    .Where(x => x.Identity == identity)
                    .Select(x => x.Context)
                    .SingleOrDefault() ?? ((key)=>Option<String>.None);

            };
        }

        internal static GetContextFixedConfigurationValue GetFixedConfigurationContext(GetContextValue getContextValue)
        {
            return (path) =>
                (getContextValue(path.ToString())).Select(x => new ConfigurationValue(x));

        }
    }
}
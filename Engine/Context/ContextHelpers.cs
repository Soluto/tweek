using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.Core.Context;
using LanguageExt;
using LanguageExt.SomeHelp;

namespace Engine.Context
{
    public delegate Task<GetContextValue> GetContextByIdentity(Identity identity);

    public static class ContextHelpers
    {
        
        internal static async Task<GetLoadedContextByIdentity> LoadContexts(HashSet<Identity> identities, GetContextByIdentity byId)
        {
            var contexts = await Task.WhenAll(identities.Select(async (Identity identity) => new { Identity = identity, Context = await byId(identity) }));
            return (Identity identity) =>
            {
                return contexts
                    .Where(x => x.Identity == identity)
                    .Select(x => x.Context)
                    .SingleOrDefault() ?? ((key) => Option<String>.None);
            };
        }

        public static GetContextValue Create(IDictionary<string, string> data)
        {
            return (key) => data.ContainsKey(key) ? data[key].ToSome() : Option<string>.None;
        }

    }
}
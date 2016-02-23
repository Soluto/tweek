using System.Collections.Generic;
using System.Linq;
using Engine.Context;
using LanguageExt;

namespace Engine
{
    public static class ContextHelpers
    {
        public static ContextRetrieverByIdentityType GetContextRetrieverByType(HashSet<Identity> identities, ContextRetrieverByIdentity retrieverById)
        {
            return type => identities
                .Where(x => x.Type == type)
                .FirstOrNone()
                .Match(x=>retrieverById(x), ()=>async key=>Option<string>.None);
        }

        public static GetContextFixedConfigurationValue GetFixedConfigurationContext(GetContextValue getContextValue)
        {
            return async (path) =>
                (await getContextValue(path.ToString())).Select(x => new ConfigurationValue(x));

        }
    }
}
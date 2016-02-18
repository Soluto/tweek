using System.Linq;
using Engine.Context;
using LanguageExt;

namespace Engine
{
    public static class ContextHelpers
    {
        public static ContextRetrieverByIdentityType GetContextRetrieverByType(Set<Identity> identities, ContextRetrieverByIdentity retrieverById)
        {
            return (type) => identities
                .Where(x => x.Type == type)
                .FirstOrNone()
                .Match(x=>retrieverById(x), ()=>async (key)=>Option<string>.None);
        }
    }
}
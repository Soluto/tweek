using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LanguageExt;

namespace Engine.Context
{
    public delegate IdentityContext ContextRetrieverByIdentity(Identity identity);
    public delegate IdentityContext ContextRetrieverByIdentityType(string identityType);
    public delegate Task<Option<string>> IdentityContext(string key);
}

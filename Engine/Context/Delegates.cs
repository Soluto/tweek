using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LanguageExt;

namespace Engine.Context
{
    public delegate GetContextValue ContextRetrieverByIdentity(Identity identity);
    public delegate GetContextValue ContextRetrieverByIdentityType(string identityType);
    public delegate Task<Option<string>> GetContextValue(string key);
    public delegate Task<Option<ConfigurationValue>> GetContextFixedConfigurationValue(ConfigurationPath path);
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LanguageExt;

namespace Engine.Context
{
    public delegate Task<GetContextValue> GetContextByIdentity(Identity identity);
    public delegate Option<string> GetContextValue(string key);

    //utils
    public delegate GetContextValue GetLoadedContextByIdentity(Identity identity);
    public delegate GetContextValue GetLoadedContextByIdentityType(string identityType);

    //move to extension
    public delegate Option<ConfigurationValue> GetContextFixedConfigurationValue(ConfigurationPath path);
}

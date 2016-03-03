using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.Core.DataTypes;
using LanguageExt;

namespace Engine.Core.Context
{
    public delegate Option<string> GetContextValue(string key);

    //utils
    public delegate GetContextValue GetLoadedContextByIdentity(Identity identity);
    public delegate GetContextValue GetLoadedContextByIdentityType(string identityType);

    //move to extension
    public delegate Option<ConfigurationValue> GetContextFixedConfigurationValue(ConfigurationPath path);
}

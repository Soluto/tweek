using FSharpUtils.Newtonsoft;
using LanguageExt;
using Tweek.Engine.DataTypes;

namespace Engine.Core.Context
{
    public delegate Option<JsonValue> GetContextValue(string key);

    //utils
    public delegate GetContextValue GetLoadedContextByIdentity(Identity identity);
    public delegate GetContextValue GetLoadedContextByIdentityType(string identityType);

    //move to extension
    public delegate Option<ConfigurationValue> GetContextFixedConfigurationValue(ConfigurationPath path);
}

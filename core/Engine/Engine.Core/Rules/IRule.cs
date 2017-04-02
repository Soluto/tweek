using Engine.Core.Context;
using Engine.DataTypes;
using LanguageExt;

namespace Engine.Core.Rules
{
    public interface IRule
    {
        Option<ConfigurationValue> GetValue(GetContextValue fullContext);
    }
}

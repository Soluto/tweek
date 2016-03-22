using Engine.Core.Context;
using Engine.Core.DataTypes;
using LanguageExt;

namespace Engine.Core.Rules
{
    public interface IRule
    {
        Option<ConfigurationValue> GetValue(GetContextValue fullContext);
    }
}

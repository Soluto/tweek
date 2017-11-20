using Engine.Core.Context;
using LanguageExt;
using Tweek.Engine.DataTypes;

namespace Engine.Core.Rules
{
    public interface IRule
    {
        Option<ConfigurationValue> GetValue(GetContextValue fullContext);
    }
}

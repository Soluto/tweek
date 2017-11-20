using LanguageExt;
using Tweek.Engine.Core.Context;
using Tweek.Engine.DataTypes;

namespace Tweek.Engine.Core.Rules
{
    public interface IRule
    {
        Option<ConfigurationValue> GetValue(GetContextValue fullContext);
    }
}
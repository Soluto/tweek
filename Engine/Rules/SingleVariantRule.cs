using Engine.Core.Context;
using Engine.Core.Rules;
using Engine.Rules.Matcher;
using LanguageExt;

namespace Engine
{
    public class SingleVariantRule : IRule
    {
        public Matcher Matcher;
        public ConfigurationValue Value;

        public Option<ConfigurationValue> GetValue(GetContextValue fullContext)
        {
            return (Matcher(fullContext)) ? Value : Option<ConfigurationValue>.None;
        }
    }

    class SingleVariantRuleImpl : SingleVariantRule
    {
    }
}
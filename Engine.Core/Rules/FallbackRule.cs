using Engine.Core.Context;
using Engine.Core.Utils;
using Engine.DataTypes;
using LanguageExt;
using static LanguageExt.Prelude;

namespace Engine.Core.Rules
{
    public class FallbackRule:IRule
    {
        private readonly IRule[] _rules;

        public static FallbackRule New(IRule l, IRule r)
        {
            return new FallbackRule(l, r);
        }

        public FallbackRule(params IRule[] rules)
        {
            _rules = rules;
        }

        public Option<ConfigurationValue> GetValue(GetContextValue fullContext)
        {
            foreach  (var rule in _rules)
            {
                var contextValue = rule.GetValue(fullContext);
                if (contextValue.IsSome) return contextValue;
            }
            return None;
        }
    }
}

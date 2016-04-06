using System.Collections.Generic;
using Engine.Core.Context;
using Engine.Core.Utils;
using Engine.DataTypes;
using LanguageExt;
using static LanguageExt.Prelude;

namespace Engine.Core.Rules
{
    public class RuleSet:IRule
    {
        private readonly IRule[] _rules;
        
        public RuleSet(params IRule[] rules)
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

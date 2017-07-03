using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.Core.Rules;
using Engine.Drivers.Rules;
using static Engine.Core.Utils.TraceHelpers;
using LanguageExt.Trans.Linq;
using LanguageExt;

//check chache

namespace Engine.Rules.Creation
{
    public delegate IRuleParser GetRuleParser(string format);

    public static class RulesLoader
    {      
        public static async Task<Func<IReadOnlyDictionary<string, IRule>>> Factory(IRulesDriver driver, GetRuleParser parserResolver)
        {
            var instance = Parse(await driver.GetAllRules(), parserResolver);
            driver.OnRulesChange += (newRules) =>
            {
                using (TraceTime("loading new rules"))
                {
                    instance = Parse(newRules, parserResolver);
                }

            };
            return () => instance;
        }

        public static IReadOnlyDictionary<string,IRule> Parse(IDictionary<string, RuleDefinition> rules, GetRuleParser parserResolver)
        {
            return rules.ToDictionary(x=>x.Key.ToLower(), x=> 
                    parserResolver(x.Value.Format).Parse(x.Value.Payload));
        }
    }
}

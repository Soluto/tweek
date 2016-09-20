using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.Core;
using Engine.Core.Rules;
using Engine.DataTypes;
using Engine.Drivers.Rules;
using Tweek.JPad;

namespace Engine.Rules.Creation
{
    public static class RulesLoader
    {      
        public static async Task<Func<IReadOnlyDictionary<string, IRule>>> Factory(IRulesDriver driver, IRuleParser parser)
        {
            var instance = Parse(await driver.GetAllRules(), parser);
            driver.OnRulesChange += (newRules) => instance = Parse(newRules, parser);
            return () => instance;
        }

        public static IReadOnlyDictionary<string,IRule> Parse(IDictionary<string, RuleDefinition> rules, IRuleParser parser)
        {
            return rules.ToDictionary(x=>x.Key.ToLower(), x=> parser.Parse(x.Value.Payload));
        }
    }
}

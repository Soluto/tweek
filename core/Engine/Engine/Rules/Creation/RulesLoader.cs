using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.Core;
using Engine.Core.Rules;
using Engine.DataTypes;
using Engine.Drivers.Rules;
using LanguageExt;
using static Engine.Core.Utils.TraceHelpers;

namespace Engine.Rules.Creation
{
    public static class RulesLoader
    {
        public static async Task<Func<(RulesRepository, PathExpander)>> Factory(IRulesDriver driver, IRuleParser parser)
        {
            var instance = Parse(await driver.GetAllRules(), parser);
            driver.OnRulesChange += (newRules) =>
            {
                using (TraceTime("loading new rules"))
                {
                    instance = Parse(newRules, parser);
                }
            };
            return () => instance;
        }

        public static (RulesRepository, PathExpander) Parse(IDictionary<string, RuleDefinition> rules, IRuleParser parser)
        {
            var tree = new RadixTree<IRule>(rules.ToDictionary(x => x.Key.ToLower(), x => parser.Parse(x.Value.Payload)));

            Option<IRule> RulesRepository(ConfigurationPath path) => tree.TryGetValue(path, out var rule) ? Option<IRule>.Some(rule) : Option<IRule>.None;

            IEnumerable<ConfigurationPath> PathExpander(ConfigurationPath path) => tree.ListPrefix(path).Select(c => c.key).Select(ConfigurationPath.New);

            return (RulesRepository, PathExpander);
        }
    }
}

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
    public delegate IRuleParser GetRuleParser(string format);

    public static class RulesLoader
    {
        public static async Task<Func<(RulesRepository, PathExpander)>> Factory(IRulesDriver driver, GetRuleParser parserResolver)
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

        public static (RulesRepository, PathExpander) Parse(IDictionary<string, RuleDefinition> rules, GetRuleParser parserResolver)
        {
            var tree = new RadixTree<IRule>(rules.ToDictionary(x => x.Key.ToLower(), x => parserResolver(x.Value.Format).Parse(x.Value.Payload)));

            Option<IRule> RulesRepository(ConfigurationPath path) => tree.TryGetValue(path, out var rule) ? Option<IRule>.Some(rule) : Option<IRule>.None;

            IEnumerable<ConfigurationPath> PathExpander(ConfigurationPath path)
            {
                if (path == ConfigurationPath.FullScan)
                {
                    return tree.AllKeys().Select(ConfigurationPath.New);
                }

                if (path.IsScan)
                {
                    return tree.ListPrefix($"{path.Folder}/").Select(c => c.key).Select(ConfigurationPath.New);
                }

                return new []{ path };
            }

            return (RulesRepository, PathExpander);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Tweek.Engine.Core;
using Tweek.Engine.Core.Context;
using Tweek.Engine.Core.Utils;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Rules;
using Tweek.Engine.Rules.Creation;
using IdentityHashSet = System.Collections.Generic.HashSet<Tweek.Engine.DataTypes.Identity>;

namespace Tweek.Engine
{
    public interface ITweek
    {
        TweekValuesResult Calculate(
            ICollection<ConfigurationPath> pathQuery,
            IdentityHashSet identities, GetLoadedContextByIdentityType context,
            ConfigurationPath[] includeFixedPaths = null);
    }

    public delegate IEnumerable<ConfigurationPath> PathExpander(ConfigurationPath path);

    public class TweekRunner : ITweek
    {
        private readonly Func<(GetRule, PathExpander)> _rulesLoader;

        public TweekRunner(Func<(GetRule, PathExpander)> rulesLoader)
        {
            _rulesLoader = rulesLoader;
        }

        public TweekValuesResult Calculate(
            ICollection<ConfigurationPath> pathQuery,
            HashSet<Identity> identities,
            GetLoadedContextByIdentityType context,
            ConfigurationPath[] includeFixedPaths = null)
        {
            includeFixedPaths = includeFixedPaths ?? new ConfigurationPath[0];
            var (getRules, expandKey) = _rulesLoader();

            var getRuleValue = EngineCore.GetRulesEvaluator(identities, context, getRules);

            var scanItems = pathQuery.Where(s => s.IsScan).ToList();
            var include = includeFixedPaths
                .Where(path => !path.IsHidden() && scanItems.Any(query => query.Contains(path)));
            var expandItems = scanItems.SelectMany(path => expandKey(path));

            var paths = include.Concat(expandItems).Concat(pathQuery.Where(t => !t.IsScan)).Distinct();

            var result = new TweekValuesResult();

            foreach (var path in paths)
            {
                try
                {
                    var ruleValue = getRuleValue(path);
                    ruleValue.IfSome(value => result.Data[path] = value);
                }
                catch (Exception e)
                {
                    result.Errors[path] = e;
                }
            }

            return result;
        }
    }

    public static class Tweek
    {
        public static async Task<ITweek> Create(IRulesRepository rulesRepository, GetRuleParser parserResolver)
        {
            var rulesLoader = await RulesLoader.Factory(rulesRepository, parserResolver);
            return new TweekRunner(rulesLoader);
        }
    }
}
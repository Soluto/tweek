using System;
using System.Collections.Generic;
using System.Linq;
using Tweek.Engine.Core;
using Tweek.Engine.Core.Context;
using Tweek.Engine.DataTypes;

namespace Tweek.Engine
{
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
}
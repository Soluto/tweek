using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.Core;
using Engine.Core.Utils;
using Engine.DataTypes;
using Engine.Drivers.Context;
using Engine.Drivers.Rules;
using Engine.Rules.Creation;
using System;
using Engine.Core.Context;
using Engine.Core.Rules;
using FSharpUtils.Newtonsoft;
using ContextHelpers = Engine.Context.ContextHelpers;
using LanguageExt;
using static LanguageExt.Prelude;
using IdentityHashSet = System.Collections.Generic.HashSet<Engine.DataTypes.Identity>;

namespace Engine
{
    public static class ITweekExtensions
    {
        private static readonly ConfigurationPath Root = ConfigurationPath.New("");
        public static Option<JsonValue> SingleKey(this IDictionary<ConfigurationPath, ConfigurationValue> results) => SingleKey(results, Root);
        public static Option<JsonValue> SingleKey(this IDictionary<ConfigurationPath, ConfigurationValue> results, ConfigurationPath path)
        {
            if (results.ContainsKey(path)) return Some(results[path].Value);
            return None;
        }

        public static Task<Dictionary<ConfigurationPath, ConfigurationValue>> GetContextAndCalculate(this ITweek tweek,
            ConfigurationPath pathQuery,
            IdentityHashSet identities,
            IContextReader contextDriver,
            GetLoadedContextByIdentityType externalContext = null)
        {
            return tweek.GetContextAndCalculate(new[] { pathQuery }, identities, contextDriver, externalContext);
        }

        public static async Task<Dictionary<ConfigurationPath, ConfigurationValue>> GetContextAndCalculate(this ITweek tweek,
            ICollection<ConfigurationPath> pathQuery,
            IdentityHashSet identities,
            IContextReader contextDriver,
            GetLoadedContextByIdentityType externalContext = null)
        {
            var allContextData = (await Task.WhenAll(identities
                    .Select(async identity => new
                    {
                        Identity = identity,
                        Context = new Dictionary<string, JsonValue>(await contextDriver.GetContext(identity), StringComparer.OrdinalIgnoreCase)
                    })))
                .ToDictionary(x => x.Identity, x => x.Context);

            externalContext = externalContext ?? ContextHelpers.EmptyContextByIdentityType;

            var loadedContexts = ContextHelpers.GetContextRetrieverByType(ContextHelpers.LoadContexts(allContextData), identities);
            var context = ContextHelpers.AddSystemContext(ContextHelpers.Fallback(externalContext, loadedContexts));
            var contextPaths = pathQuery.Any(x => x.IsScan) ? allContextData.Values.SelectMany(x => x.Keys)
                .Where(x => x.Contains("@fixed:"))
                .Select(x => x.Split(':')[1])
                .Select(ConfigurationPath.New).ToArray() : null;


            return tweek.Calculate(pathQuery, identities, context, contextPaths);
        }

        public static Dictionary<ConfigurationPath, ConfigurationValue> Calculate(this ITweek tweek,
            ConfigurationPath pathQuery,
            IdentityHashSet identities, GetLoadedContextByIdentityType context, ConfigurationPath[] includeFixedPaths = null)
        {
            return tweek.Calculate(new[] { pathQuery }, identities, context, includeFixedPaths);
        }
    }

    public interface ITweek
    {
        Dictionary<ConfigurationPath, ConfigurationValue> Calculate(
            ICollection<ConfigurationPath> pathQuery,
            IdentityHashSet identities, GetLoadedContextByIdentityType context, ConfigurationPath[] includeFixedPaths = null);
    }

    public delegate IEnumerable<ConfigurationPath> PathExpander(ConfigurationPath path);

    public class TweekRunner : ITweek
    {
        private readonly Func<(GetRule, PathExpander)> _rulesLoader;

        public TweekRunner(Func<(GetRule, PathExpander)> rulesLoader)
        {
            _rulesLoader = rulesLoader;
        }

        public Dictionary<ConfigurationPath, ConfigurationValue> Calculate(
            ICollection<ConfigurationPath> pathQuery,
            IdentityHashSet identities,
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

            var paths = include.Concat(expandItems).Concat(pathQuery.Where(t => !t.IsScan));

            return paths
                .Distinct()
                .Select(path => getRuleValue(path).Map(value => new { path, value }))
                .SkipEmpty()
                .ToDictionary(x => x.path, x => x.value);
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

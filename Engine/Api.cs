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

namespace Engine
{
    public interface ITweek
    {
        Task<Dictionary<ConfigurationPath, ConfigurationValue>> Calculate(
            ICollection<ConfigurationPath> pathQuery,
            HashSet<Identity> identities, 
            GetLoadedContextByIdentityType externalContext = null);
    }

    public static class TweekExtensions
    {
        public static  Task<Dictionary<ConfigurationPath, ConfigurationValue>> Calculate(this ITweek tweek,
            ConfigurationPath pathQuery,
            HashSet<Identity> identities,
            GetLoadedContextByIdentityType externalContext = null)
        {
            return tweek.Calculate(new []{ pathQuery }, identities, externalContext);
        }
    }

    public class TweekRunner : ITweek
    {
        private readonly IContextReader _contextDriver;
        private readonly Func<IReadOnlyDictionary<string, IRule>> _rulesLoader;

        public TweekRunner(IContextReader contextDriver,
            Func<IReadOnlyDictionary<string, IRule>> rulesLoader)
        {
            _contextDriver = contextDriver;
            _rulesLoader = rulesLoader;
        }

        private HashSet<ConfigurationPath> GetAllPaths(
            Dictionary<Identity, Dictionary<string, JsonValue>> allContextData,
            IReadOnlyDictionary<string, IRule> ruleset, 
            ICollection<ConfigurationPath> query)
        {
            return new HashSet<ConfigurationPath>(allContextData.Values.SelectMany(x => x.Keys)
                .Where(x => x.Contains("@fixed:"))
                .Select(x=>x.Split(':')[1]) 
                .Concat(ruleset.Keys)
                .Select(ConfigurationPath.New)
                .Where(path => query.Any(queryPath => ConfigurationPath.Match(path, queryPath)))
                .Distinct());
        }

        public async Task<Dictionary<ConfigurationPath, ConfigurationValue>> Calculate(
            ICollection<ConfigurationPath> pathQuery,
            HashSet<Identity> identities, 
            GetLoadedContextByIdentityType externalContext = null)
        {
            var allContextData = (await Task.WhenAll(identities
                .Select(async identity => new
                    {
                        Identity = identity,
                        Context = new Dictionary<string,JsonValue>(await _contextDriver.GetContext(identity), StringComparer.OrdinalIgnoreCase )
                    })))
                .ToDictionary(x => x.Identity, x => x.Context);
            
            var allRules = _rulesLoader();

            externalContext = externalContext ?? ContextHelpers.EmptyContextByIdentityType;
            
            var loadedContexts = ContextHelpers.GetContextRetrieverByType(ContextHelpers.LoadContexts(allContextData), identities);
            var context =  ContextHelpers.Fallback(externalContext, loadedContexts);
            
            var getRuleValue = EngineCore.GetRulesEvaluator(identities, context, (path)=>allRules.TryGetValue(path));
            
            var paths = GetAllPaths(allContextData, allRules, pathQuery);

            return paths
                .Select(path => getRuleValue(path).Map(value=>new {path, value}))
                .SkipEmpty()
                .ToDictionary(x => x.path, x => x.value);
        }
    }

    public static class Tweek
    {
        public static async Task<ITweek> Create(IContextReader contextDriver, IRulesDriver rulesDriver, IRuleParser parser)
        {
            var rulesLoader = await RulesLoader.Factory(rulesDriver, parser);
            return new TweekRunner(contextDriver, rulesLoader);
        }
    }
}

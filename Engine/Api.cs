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
using Tweek.JPad;
using ContextHelpers = Engine.Context.ContextHelpers;
using LanguageExt;

namespace Engine
{
    public interface ITweek
    {
        Task<Dictionary<ConfigurationPath, ConfigurationValue>> Calculate(
            ConfigurationPath pathQuery,
            HashSet<Identity> identities, GetLoadedContextByIdentityType externalContext = null);
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


        private HashSet<ConfigurationPath> GetAllPaths(Dictionary<Identity, Dictionary<string, string>> allContextData,
            IReadOnlyDictionary<string, IRule> ruleset, ConfigurationPath query)
        {
            return new HashSet<ConfigurationPath>(allContextData.Values.SelectMany(x => x.Keys)
                .Where(x => x.Contains("@fixed:"))
                .Select(x=>x.Split(':')[1]) 
                .Concat(ruleset.Keys)
                .Select(ConfigurationPath.New)
                .Where(path => ConfigurationPath.Match(path: path, query: query))
                .Distinct());
        }

        public async Task<Dictionary<ConfigurationPath, ConfigurationValue>> Calculate(ConfigurationPath pathQuery,
            HashSet<Identity> identities, 
            GetLoadedContextByIdentityType externalContext = null)
        {
            var allContextData = (await Task.WhenAll(identities.Select(async identity => new { Identity = identity, Context = await _contextDriver.GetContext(identity) })))
                                  .ToDictionary(x=>x.Identity, x=>x.Context);
            var allRules = _rulesLoader();

            var paths = GetAllPaths(allContextData, allRules, pathQuery);

            externalContext = externalContext ?? ContextHelpers.EmptyContextByIdentityType;
            
            var loadedContexts = ContextHelpers.GetContextRetrieverByType(ContextHelpers.LoadContexts(allContextData), identities);
            var contexts =  ContextHelpers.Fallback(externalContext, loadedContexts);
            var pathsWithRules = paths.Select(path => new { Path = path, Rules = allRules.TryGetValue(path) }).ToList();

            return pathsWithRules
                .AsParallel()
                .Select(x =>
                    EngineCore.CalculateKey(identities, contexts, x.Path, p=>allRules.TryGetValue(p)).Select(value => new { path = x.Path.ToRelative(pathQuery), value })
                 )
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

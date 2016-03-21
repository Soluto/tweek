using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.Context;
using Engine.Core;
using Engine.Core.DataTypes;
using Engine.Core.Utils;
using Engine.Keys;
using Engine.Rules;
using LanguageExt;

namespace Engine
{
    public interface ITweek
    {
        Task<Dictionary<ConfigurationPath, ConfigurationValue>> Calculate(
            ConfigurationPath pathQuery,
            HashSet<Identity> identities);
    }

    public class Tweek : ITweek
    {
        private readonly GetContextByIdentity _getContext;
        private readonly RulesRepository _rules;
        private readonly PathTraversal _pathTraversal;

        public Tweek(GetContextByIdentity getContext,
            PathTraversal pathTraversal,
            RulesRepository rules)
        {
            _getContext = getContext;
            _rules = rules;
            _pathTraversal = pathTraversal;
        }

        public async Task<Dictionary<ConfigurationPath, ConfigurationValue>> Calculate(ConfigurationPath pathQuery, HashSet<Identity> identities)
        {
            var paths = _pathTraversal(pathQuery);
            var contexts = await ContextHelpers.LoadContexts(identities, _getContext);
            var pathsWithRules = paths.Select(path => new { Path = path, Rules = _rules(path) }).ToList();

            return pathsWithRules.Select(x =>
                    EngineCore.CalculateKey(identities, contexts, x.Path, _rules).Select(value => new { path = x.Path.ToRelative(pathQuery), value })
                 )
                .SkipEmpty()
                .ToDictionary(x => x.path, x => x.value);
        }
    }
}

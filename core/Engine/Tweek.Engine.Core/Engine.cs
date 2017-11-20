using Engine.Core.Context;
using Engine.Core.Rules;
using FSharpUtils.Newtonsoft;
using LanguageExt;
using System.Collections.Generic;
using System.Linq;
using Tweek.Engine.DataTypes;
using IdentityHashSet = System.Collections.Generic.HashSet<Tweek.Engine.DataTypes.Identity>;

namespace Engine.Core
{
    public delegate Option<IRule> GetRule(ConfigurationPath path);

    public static class EngineCore
    {
        public delegate Option<ConfigurationValue> GetRuleValue(ConfigurationPath path);

        public static GetRuleValue GetRulesEvaluator(IdentityHashSet identities, GetLoadedContextByIdentityType contextByIdentity, GetRule getRule)
        {
            var identityTypes = identities.Select(x => x.Type).ToArray();
            var flattenContext = ContextHelpers.FlattenLoadedContext(contextByIdentity);

            GetRuleValue getRuleValue = null;
            GetContextValue recursiveContext = key =>
            {
                if (key.StartsWith("@@key:")){
                    key = key.Replace("@@key:", "keys.");
                }
                if (!key.StartsWith("keys.")) return Option<JsonValue>.None;
                var path = new ConfigurationPath(key.Split('.')[1]);
                return getRuleValue(path).Map(x => x.Value);
            };

            var context = ContextHelpers.Merge(flattenContext, recursiveContext);

            getRuleValue = Memoize(path =>
            {
                foreach (var identity in identityTypes)
                {
                    var fixedResult = ContextHelpers.GetFixedConfigurationContext(context, identity)(path);
                    if (fixedResult.IsSome) return fixedResult;
                }
                return getRule(path).Bind(x => x.GetValue(context));
            });
            return getRuleValue;
        }

        private static GetRuleValue Memoize(GetRuleValue getRuleValue)
        {
            var dict = new Dictionary<ConfigurationPath, Option<ConfigurationValue>>();
            return path =>
            {
                if (!dict.TryGetValue(path, out var result))
                {
                    result = getRuleValue(path);
                    dict[path] = result;
                }
                return result;
            };
        }
    }
}

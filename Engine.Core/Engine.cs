using System.Collections.Generic;
using System.Linq;
using Engine.Core.Context;
using Engine.Core.Rules;
using LanguageExt;
using Engine.Core.Utils;
using Engine.DataTypes;

namespace Engine.Core
{
    public delegate Option<IRule> RulesRepository(ConfigurationPath path);

    public static class EngineCore
    {
        internal static Option<ConfigurationValue> CalculateRule(
            IRule rule,
            GetContextValue contextByIdentityType)
        {
            return rule.GetValue(contextByIdentityType);
        }

        public static Option<ConfigurationValue> CalculateKey(HashSet<Identity> identities,
            GetLoadedContextByIdentityType loadedContext,
            ConfigurationPath path,
            RulesRepository rules)
        {

            var flattenContext = ContextHelpers.FlattenLoadedContext(loadedContext);

            GetContextValue recCalculateKeyContext = key =>
            {
                if (!key.StartsWith("@@key")) return Option<string>.None;
                return CalculateKey(identities, loadedContext, new ConfigurationPath(key.Split(':')[1]), rules).Map(x => x.ToString());
            };

            var fullContext = ContextHelpers.Merge(flattenContext, recCalculateKeyContext);

            var fixedResult = Option<ConfigurationValue>.None;
            foreach (var identityType in identities.Select(x => x.Type))
            {
                fixedResult = ContextHelpers.GetFixedConfigurationContext(fullContext, identityType)(path);
                if (fixedResult.IsSome) break;
            }

            var result = fixedResult.IfNone(() => rules(path).Bind(rule=>CalculateRule(rule, fullContext)));

            return result;
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.Context;
using Engine.Keys;
using Engine.Rules;
using LanguageExt;
using LanguageExt.SomeHelp;

namespace Engine
{
    internal delegate Task<Dictionary<ConfigurationPath, ConfigurationValue>> Calculate(
        ConfigurationPath path,
        PathTraversal traversal,
        HashSet<Identity> identities,
        GetContextByIdentity getContext,
        RulesRetriever rules);


    internal static class _
    {
        internal static CalculateRules calculateRules = (list, context) => new ConfigurationValue();

        internal static Calculate CalculateImpl = async (pathQuery,
            traversal, 
            identities,
            contextRetriever, 
            rules) =>
        {
         
            var paths = traversal(pathQuery);
            var contexts = await ContextHelpers.LoadContexts(identities, contextRetriever);
            var calculatedContext = ContextHelpers.GetContextRetrieverByType(contexts, identities);

            return paths.Select(configPath =>
            {
                var fixedResult = Option<ConfigurationValue>.None;
                foreach (var identity in identities)
                {
                    fixedResult = ContextHelpers.GetFixedConfigurationContext(contexts(identity))(configPath);
                    if (fixedResult.IsSome) break;
                }

                fixedResult =  fixedResult.IfNone(() => calculateRules(rules(configPath), calculatedContext));
                
                return fixedResult.Select(value => new {configPath, value});
            })
            .SkipEmpty()
            .ToDictionary(x => x.configPath, x => x.value);
        };
    } 
}

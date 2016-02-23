using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.Context;
using Engine.Fixed;
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
        ContextRetrieverByIdentity contextRetriever,
        RulesRetriever rules);


    internal static class _
    {
        internal static CalculateRules calculateRules = async (list, context) => new ConfigurationValue();

        internal static Calculate CalculateImpl = async (pathQuery,
            traversal, 
            identities,
            contextRetriever, 
            rules) =>
        {
         
            var paths = traversal(pathQuery);
            var calculatedContext = ContextHelpers.GetContextRetrieverByType(identities, contextRetriever);

            return (await Task.WhenAll(paths.Select(async configPath =>
            {
                var fixedResult = Option<ConfigurationValue>.None;
                foreach (var identity in identities)
                {
                    fixedResult =  await ContextHelpers.GetFixedConfigurationContext(contextRetriever(identity))(configPath);
                    if (fixedResult.IsSome) break;
                }

                fixedResult = (await fixedResult.IfNoneAsync(() => calculateRules(rules(configPath), calculatedContext)));
                
                return fixedResult.Select(value => new {configPath, value});

            })))
            .SkipEmpty()
            .ToDictionary(x => x.configPath, x => x.value);
        };
    } 
}

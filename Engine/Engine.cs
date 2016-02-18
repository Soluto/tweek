using System;
using System.Collections.Generic;
using System.Linq;
using Engine.Context;
using Engine.Fixed;
using Engine.Keys;
using Engine.Rules;
using LanguageExt;

namespace Engine
{
    public delegate Dictionary<ConfigurationPath, ConfigurationValue> Calculate(
        ConfigurationPath path,
        PathTraversal traversal,
        Set<Identity> identities,
        ContextRetrieverByIdentity contextRetriever,
        FixedConfigurationRetriever fixedConfiguration,
        RulesRetriever rules);

    internal static class _
    {
        internal static CalculateRules calculateRules = (list, context) => new ConfigurationValue();

        internal static Calculate CalculateImpl = (pathQuery,
            traversal, 
            identities,
            contextRetriever, 
            fixedConfiguration, 
            rules) =>
        {
            var paths = traversal(pathQuery);
            var calculatedContext = ContextHelpers.GetContextRetrieverByType(identities, contextRetriever);

            return paths.Select(configPath =>
            {
                return identities.Scan(Option<ConfigurationValue>.None,
                    (acc, identity) => acc.IfNone(() => fixedConfiguration(identity, configPath)))
                    .TakeWhile(x => x.IsNone)
                    .Last()
                    .IfNone(() => calculateRules(rules(configPath), calculatedContext))
                    .Select(value => new {configPath, value});
            }).SkipEmpty()
                .ToDictionary(x => x.configPath, x => x.value);
        };
    }
   

    
}

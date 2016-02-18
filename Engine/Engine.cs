using System.Collections.Generic;
using System.Linq;
using System.Security.Principal;
using System.Text;
using System.Threading.Tasks;
using Engine.Context;
using Engine.Fixed;
using Engine.Path;
using Engine.Rules;
using LanguageExt;
using LanguageExt.Trans.Linq;

namespace Engine
{
    

    interface IEngine
    {
        Dictionary<ConfigurationPath, ConfigurationValue> Calculate(
            ConfigurationPath path, 
            PathTraversal traversal,
            Set<Identity> identities,
            ContextRetrieverByIdentity contextRetriever, 
            FixedConfigurationRetriever fixedConfiguration,
            RulesRetriever rules);
    }

    class Engine : IEngine
    {
        public Dictionary<ConfigurationPath, ConfigurationValue> Calculate(ConfigurationPath pathQuery, 
            PathTraversal traversal, 
            Set<Identity> identities,
            ContextRetrieverByIdentity contextRetriever,
            FixedConfigurationRetriever fixedConfiguration, 
            RulesRetriever rules)
        {
            CalculateRules calculateRules = (list, context) => new ConfigurationValue();
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
        }
    }
}

using System;
using System.Collections.Generic;
using Engine.Drivers.Rules;
using Engine.Core.Rules;
using Engine.Rules.Creation;
using System.Threading.Tasks;

namespace Engine.Rules.Validation
{
    public static class Validator
    {
        public delegate Task<bool> ValidationDelegate(IDictionary<string, RuleDefinition> rules);

        public static ValidationDelegate GetValidationDelegate(GetRuleParser parserResolver) => rules => Validate(rules, parserResolver);

        private static async Task<bool> Validate(IDictionary<string, RuleDefinition> rules, GetRuleParser parserResolver)
        {
            var parsingTask = Task.Run(() =>
                {
                    try
                    {
                        RulesLoader.Parse(rules, parserResolver);
                        return true;
                    }
                    catch (Exception)
                    {
                        return false;
                    }
                });

            var dependencyCheckingTask = Task.Run(() => !DependencyChecker.HasCircularDependencies(rules));

            await Task.WhenAll(parsingTask, dependencyCheckingTask);
            return (await parsingTask) && (await dependencyCheckingTask);
        }
    }
}

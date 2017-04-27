using System;
using System.Collections.Generic;
using System.Threading;
using Engine.Drivers.Rules;
using Engine.Core.Rules;
using Engine.Rules.Creation;
using System.Threading.Tasks;

namespace Engine.Rules.Validation
{
    public static class Validator
    {
        public static async Task<bool> Validate(IDictionary<string, RuleDefinition> rules, IRuleParser parser)
        {
            var tokenSource = new CancellationTokenSource();
            var parsingTask = Task.Run(() =>
                {
                    try
                    {
                        RulesLoader.Parse(rules, parser);
                        return true;
                    }
                    catch (Exception)
                    {
                        return false;
                    }
                }, tokenSource.Token);

            var dependencyCheckingTask = Task.Run(() => !DependencyChecker.HasCircularDependencies(rules), tokenSource.Token);

            var result = await Task.WhenAny(parsingTask, dependencyCheckingTask);
            tokenSource.Cancel();
            return await result;
        }
    }
}

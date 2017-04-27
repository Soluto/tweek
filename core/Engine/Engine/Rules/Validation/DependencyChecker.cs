using System;
using System.Collections.Generic;
using System.Linq;
using Engine.Drivers.Rules;

namespace Engine.Rules.Validation
{
    public static class DependencyChecker
    {
        public static bool HasCircularDependencies(IDictionary<string, RuleDefinition> rules)
        {
            var keysWithDeps = rules
                .Where(pair=> pair.Value.Dependencies != null && pair.Value.Dependencies.Length != 0)
                .ToDictionary(pair => pair.Key, pair => new HashSet<string>(pair.Value.Dependencies));

            var visited = new HashSet<string>();
            var recursionVisiting = new HashSet<string>();
            return keysWithDeps.Any(pair => HasCircularDependencies(pair.Key, keysWithDeps, visited, recursionVisiting));
        }

        private static bool HasCircularDependencies(string key, IDictionary<string, HashSet<string>> keysWithDeps, HashSet<string> visited, HashSet<string> recursionVisiting)
        {
            if (!visited.Contains(key))
            {
                visited.Add(key);
                recursionVisiting.Add(key);

                if (keysWithDeps.ContainsKey(key))
                {
                    foreach (var dependency in keysWithDeps[key])
                    {
                        if (!visited.Contains(dependency) && HasCircularDependencies(dependency, keysWithDeps, visited, recursionVisiting))
                        {
                            return true;
                        }
                        else if (recursionVisiting.Contains(dependency))
                        {
                            return true;
                        }
                    }
                }
            }

            recursionVisiting.Remove(key);
            return false;
        }
    }
}

using System.Collections.Generic;
using System.Linq;
using Tweek.Engine.Drivers.Rules;

namespace Tweek.Engine.Rules.Validation
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
            foreach (var pair in keysWithDeps)
            {
                if (HasCircularDependencies(pair.Key, keysWithDeps, visited, recursionVisiting)) return true;
            }
            return false;
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

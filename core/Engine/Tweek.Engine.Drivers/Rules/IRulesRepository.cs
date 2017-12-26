using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Tweek.Engine.Drivers.Rules
{
    public interface IRulesRepository
    {
        event Action<IDictionary<string, RuleDefinition>> OnRulesChange;
        Task<Dictionary<string, RuleDefinition>> GetAllRules();
        string CurrentLabel { get; }
        DateTime LastCheckTime { get; }
    }

    public class RuleDefinition
    {
        public string Format { get; set; }
        public string Payload { get; set; }
        public string[] Dependencies { get; set; }
    }

    public class RuleDefinitionComparer : IEqualityComparer<RuleDefinition>
    {
        public bool Equals(RuleDefinition x, RuleDefinition y)
        {
            if (x == y)
                return true;

            if (x == null || y == null)
                return false;

            return string.Equals(x.Format, y.Format) && string.Equals(x.Payload, y.Payload);
        }

        public int GetHashCode(RuleDefinition obj)
        {
            return obj.GetHashCode();
        }
    }
}

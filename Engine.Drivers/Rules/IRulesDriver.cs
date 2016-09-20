using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Engine.Drivers.Rules
{
    public class RuleDefinition
    {
        public string Format { get; set; }
        public string Payload { get; set; }
    }

    public interface IRulesDriver
    {
        event Action<IDictionary<string, RuleDefinition>> OnRulesChange;
        Task<Dictionary<string, RuleDefinition>> GetAllRules();
    }
}
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
        Task<Dictionary<string, RuleDefinition>> GetAllRules();
    }
}
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Engine.Rules.Creation;

namespace Engine.Drivers.Rules
{
    public interface IRulesDriver
    {
        event Action OnRulesChange;
        Task<List<RuleData>> GetRules();
    }
}
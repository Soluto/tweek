using System;
using System.Collections.Generic;
using Engine.Drivers.Rules;
using Tweek.ApiService.Addons;

namespace Tweek.ApiService.NetCore.Diagnostics
{
    public class RulesDriverStatusService : IDisposable, IDiagnosticsProvider
    {
        public string Name { get; } = "RulesDriverStatusService";

        private DateTime _lastRulesUpdate;
        private readonly IRulesDriver _rulesDriver;

        public RulesDriverStatusService(IRulesDriver rulesDriver)
        {
            _rulesDriver = rulesDriver;

            _rulesDriver.OnRulesChange += OnRulesChange;
        }

        private void OnRulesChange(IDictionary<string, RuleDefinition> ruleDefinitions)
        {
            _lastRulesUpdate = DateTime.UtcNow;
        }

        public void Dispose()
        {
            _rulesDriver.OnRulesChange -= OnRulesChange; 
        }

        public object GetDetails()
        {
            return new { LastUpdateTime = _lastRulesUpdate };
        }

        public bool IsAlive()
        {
            return true;
        }
    }
}
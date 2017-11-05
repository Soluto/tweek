using System;
using Engine.Drivers.Rules;
using Tweek.ApiService.Addons;

namespace Tweek.Drivers.Rules.Diagnostics
{
    public class RulesDriverHealthCheck : IDiagnosticsProvider
    {
        private readonly IRulesDriver _driver;

        public RulesDriverHealthCheck(IRulesDriver driver)
        {
            _driver = driver;
        }
        public string Name { get; } = "RulesDriver";
        public object GetDetails() => new {_driver.CurrentLabel, _driver.LastCheckTime };

        public bool IsAlive() => !string.IsNullOrEmpty(_driver.CurrentLabel) && DateTime.UtcNow - _driver.LastCheckTime < TimeSpan.FromMinutes(5);
    }
}

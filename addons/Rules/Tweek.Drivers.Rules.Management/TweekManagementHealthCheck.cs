using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using App.Metrics.Health;
using Engine.Drivers.Rules;
using Tweek.ApiService.Addons;

namespace Tweek.Drivers.Rules.Management
{
    public class TweekManagementHealthCheck : IDiagnosticsProvider
    {
        private readonly TweekManagementRulesDriver _driver;

        public TweekManagementHealthCheck(TweekManagementRulesDriver driver)
        {
            _driver = driver;
        }
        public string Name { get; } = "TweekManagementRulesDriver";
        public object GetDetails() => new {_driver.CurrentLabel, _driver.LastCheckTime };

        public bool IsAlive() => !String.IsNullOrEmpty(_driver.CurrentLabel) && DateTime.UtcNow - _driver.LastCheckTime < TimeSpan.FromMinutes(5);
    }
}

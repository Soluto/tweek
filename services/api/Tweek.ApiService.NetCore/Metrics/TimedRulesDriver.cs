using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using App.Metrics;
using App.Metrics.Core.Options;
using Engine.Drivers.Rules;

namespace Tweek.ApiService.NetCore.Metrics
{
    public class TimedRulesDriver : IRulesDriver
    {
        private readonly IRulesDriver _rulesDriver;
        private readonly IMetrics _metrics;

        private readonly TimerOptions _getRulesTimer;

        public TimedRulesDriver(IRulesDriver rulesDriver, IMetrics metrics, string label = "RulesDriver")
        {
            _rulesDriver = rulesDriver;
            _metrics = metrics;
            _getRulesTimer = new TimerOptions
            {
                Context = label,
                Name = "GetAll",
                MeasurementUnit = Unit.None,
                DurationUnit = TimeUnit.Milliseconds,
                RateUnit = TimeUnit.Seconds,
            };
        }

        public event Action<IDictionary<string, RuleDefinition>> OnRulesChange
        {
            add { _rulesDriver.OnRulesChange += value; }
            remove { _rulesDriver.OnRulesChange -= value; }
        }

        public async Task<Dictionary<string, RuleDefinition>> GetAllRules()
        {
            using (_metrics.Measure.Timer.Time(_getRulesTimer))
            {
                return await _rulesDriver.GetAllRules();
            }
        }
    }
}

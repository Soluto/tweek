using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using App.Metrics;
using App.Metrics.Core.Options;
using Tweek.ApiService.Utils;
using Tweek.Engine.Drivers.Rules;

namespace Tweek.ApiService.Metrics
{
    public class TimedRulesDriver : IRulesDriver
    {
        private readonly IRulesDriver _rulesDriver;
        private readonly Lazy<IMetrics> _metrics;

        private readonly TimerOptions _getVersionTimer;
        private readonly TimerOptions _getRulesetTimer;

        public TimedRulesDriver(IRulesDriver rulesDriver, Func<IMetrics> metrics, string timerContext = "RulesDriver")
        {
            _rulesDriver = rulesDriver;
            _metrics = new Lazy<IMetrics>(metrics);
            _getVersionTimer = timerContext.GetTimer("GetVersion");
            _getRulesetTimer = timerContext.GetTimer("GetRuleset");
        }

        public async Task<string> GetVersion(CancellationToken cancellationToken = default(CancellationToken))
        {
            using (_metrics.Value.Measure.Timer.Time(_getVersionTimer))
            {
                return await _rulesDriver.GetVersion(cancellationToken);
            }
        }

        public async Task<Dictionary<string, RuleDefinition>> GetRuleset(string version, CancellationToken cancellationToken = default(CancellationToken))
        {
            using (_metrics.Value.Measure.Timer.Time(_getRulesetTimer))
            {
                return await _rulesDriver.GetRuleset(version, cancellationToken);
            }
        }
    }
}
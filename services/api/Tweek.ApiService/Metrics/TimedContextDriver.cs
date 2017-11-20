using App.Metrics;
using App.Metrics.Core.Options;
using FSharpUtils.Newtonsoft;
using System.Collections.Generic;
using System.Threading.Tasks;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;

namespace Tweek.ApiService.Metrics
{
    public class TimedContextDriver : IContextDriver
    {
        private readonly IContextDriver _contextDriver;
        private readonly IMetrics _metrics;

        private readonly string _timerContext;
        private readonly TimerOptions _getContextTimer;
        private readonly TimerOptions _appendContextTimer;
        private readonly TimerOptions _removeContextTimer;

        public TimedContextDriver(IContextDriver contextDriver, IMetrics metrics, string label = "ContextDriver")
        {
            _contextDriver = contextDriver;
            _metrics = metrics;
            _timerContext = label;
            _getContextTimer = GetTimer("Get");
            _appendContextTimer = GetTimer("Append");
            _removeContextTimer = GetTimer("Remove");
        }

        public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
        {
            using (_metrics.Measure.Timer.Time(_getContextTimer))
            {
                return await _contextDriver.GetContext(identity);
            }
        }

        public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            using (_metrics.Measure.Timer.Time(_appendContextTimer))
            {
                await _contextDriver.AppendContext(identity, context);
            }
        }

        public async Task RemoveFromContext(Identity identity, string key)
        {
            using (_metrics.Measure.Timer.Time(_removeContextTimer))
            {
                await _contextDriver.RemoveFromContext(identity, key);
            }
        }

        private TimerOptions GetTimer(string name)
        {
            return new TimerOptions
            {
                Context = _timerContext,
                Name = name,
                MeasurementUnit = Unit.None,
                DurationUnit = TimeUnit.Milliseconds,
                RateUnit = TimeUnit.Seconds,
            };
        }
    }
}
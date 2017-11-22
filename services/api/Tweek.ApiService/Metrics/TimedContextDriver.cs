using App.Metrics;
using App.Metrics.Core.Options;
using FSharpUtils.Newtonsoft;
using System.Collections.Generic;
using System.Threading.Tasks;
using Tweek.ApiService.Utils;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;

namespace Tweek.ApiService.Metrics
{
    public class TimedContextDriver : IContextDriver
    {
        private readonly IContextDriver _contextDriver;
        private readonly IMetrics _metrics;

        private readonly TimerOptions _getContextTimer;
        private readonly TimerOptions _appendContextTimer;
        private readonly TimerOptions _removeContextTimer;

        public TimedContextDriver(IContextDriver contextDriver, IMetrics metrics, string timerContext = "ContextDriver")
        {
            _contextDriver = contextDriver;
            _metrics = metrics;
            _getContextTimer = timerContext.GetTimer("Get");
            _appendContextTimer = timerContext.GetTimer("Append");
            _removeContextTimer = timerContext.GetTimer("Remove");
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
    }
}
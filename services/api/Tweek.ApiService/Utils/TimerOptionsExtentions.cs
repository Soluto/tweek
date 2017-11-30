using App.Metrics;
using App.Metrics.Core.Options;

namespace Tweek.ApiService.Utils
{
    public static class TimerOptionsExtentions
    {
        public static TimerOptions GetTimer(this string timerContext, string name)
        {
            return new TimerOptions
            {
                Context = timerContext,
                Name = name,
                MeasurementUnit = Unit.None,
                DurationUnit = TimeUnit.Milliseconds,
                RateUnit = TimeUnit.Seconds,
            };
        }
    }
}

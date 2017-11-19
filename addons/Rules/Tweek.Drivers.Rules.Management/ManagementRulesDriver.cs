using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Reactive.Linq;
using System.Threading;
using System.Threading.Tasks;
using App.Metrics;
using App.Metrics.Core.Abstractions;
using App.Metrics.Core.Options;
using Engine.Drivers.Rules;
using static LanguageExt.Prelude;

namespace Tweek.Drivers.Rules.Management
{
    public class ManagementRulesDriver : IRulesDriver
    {
        private const string RULESET_PATH = "/ruleset/latest";
        private const string RULESET_LATEST_VERSION_PATH = "/ruleset/latest/version";

        private readonly HttpGet _getter;
        private readonly ManagementSettings _settings;
        private readonly Func<string, Task<HttpResponseMessage>> _measuredGetter;
        private readonly Func<HttpResponseMessage, Task<Dictionary<string, RuleDefinition>>> _measuredDownloader;

        public ManagementRulesDriver(HttpGet getter, ManagementSettings settings, IMeasureMetrics metrics = null)
        {
            _settings = settings;
            _getter = getter;
            _measuredGetter = MeasureAsync<string, HttpResponseMessage>(metrics, "download_latest_header", s => getter(s));
            _measuredDownloader = MeasureAsync(metrics, "download_ruleset", (HttpResponseMessage message) => message.ExtractRules());
        }

        public IObservable<string> OnVersion()
        {
            return Observable.FromAsync(() => _measuredGetter(RULESET_LATEST_VERSION_PATH))
                .SelectMany(x => x.Content.ReadAsStringAsync())
                .Concat(Observable.Empty<string>().Delay(_settings.SampleInterval))
                .Repeat();
        }

        public async Task<Dictionary<string, RuleDefinition>> GetRuleset(string version, CancellationToken cancellationToken = default(CancellationToken))
        {
            var rulesetResponse = await _getter(RULESET_PATH);
            var newVersion = rulesetResponse.GetRulesVersion();
            if (!version.Equals(newVersion))
            {
                throw new Exception($"Version mismatch.\nExpected: ${version}\nBut was: ${newVersion}");
            }
            return await _measuredDownloader(rulesetResponse);
        }

        private static TimerOptions GetTimerOptions(string name)
        {
            return new TimerOptions
            {
                Name = name,
                Context = "TweekManagementRulesDriver",
                DurationUnit = TimeUnit.Milliseconds,
                MeasurementUnit = Unit.None,
                RateUnit = TimeUnit.Minutes
            };
        }

        private static Func<T, Task<U>> MeasureAsync<T, U>(IMeasureMetrics metrics, string name, Func<T, Task<U>> mapFunc)
        {
            return Optional(metrics)
                .Match(someMetrics =>
                    async t =>
                    {
                        using (someMetrics.Timer.Time(GetTimerOptions(name)))
                        {
                            return await mapFunc(t);
                        }
                    }, () => mapFunc);
        }
    }
}

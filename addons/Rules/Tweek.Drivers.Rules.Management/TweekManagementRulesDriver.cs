using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Reactive.Concurrency;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Text;
using System.Threading.Tasks;
using App.Metrics;
using App.Metrics.Core.Options;
using Engine.Drivers.Rules;
using LanguageExt;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Newtonsoft.Json;
using static LanguageExt.Prelude;
using Unit = App.Metrics.Unit;

namespace Tweek.Drivers.Rules.Management
{

    public class TweekManagementRulesDriver : IRulesDriver, IDisposable
    {
        public event Action<IDictionary<string, RuleDefinition>> OnRulesChange;
        
        private const string RULESET_PATH =  "/ruleset/latest";
        private IDisposable _subscrption;
        private readonly ReplaySubject<(string label, Dictionary<string, RuleDefinition> rules)> _subject;
        private readonly IObservable<(string label, Dictionary<string, RuleDefinition> rules)> _pipeline;
        public string CurrentLabel { get; private set; }

        public DateTime LastCheckTime = DateTime.UtcNow;

        private static TimerOptions GetTimerOptions(string name)
        {
            return new TimerOptions()
            {
                Name = name,
                Context = "TweekManagementRulesDriver",
                DurationUnit = TimeUnit.Milliseconds,
                MeasurementUnit = Unit.None,
                RateUnit = TimeUnit.Minutes
            };
        }
        
        private static Func<T, Task<U>> MeasureAsync<T, U>(IMetrics metrics, string name, Func<T, Task<U>> mapFunc) => Optional(metrics).Match(someMetrics => 
        async (T t) =>
        {
            using (someMetrics.Measure.Timer.Time(GetTimerOptions(name)))
            {
                return await mapFunc(t);
            }
        }, ()=> mapFunc);

        private TweekManagementRulesDriver(HttpGet getter, ILogger logger = null, IMetrics metrics = null, IScheduler scheduler = null)
        {
            logger = logger ?? NullLogger.Instance;
            _subject = new ReplaySubject<(string, Dictionary<string, RuleDefinition>)>(1);
            scheduler = scheduler ?? TaskPoolScheduler.Default;
            var measuredGetter = MeasureAsync<string, HttpResponseMessage>(metrics, "download_latest_header", s=>getter(s));
            var measuredDownloader = MeasureAsync(metrics, "download_ruleset", (HttpResponseMessage message)=> message.ExtractRules());

            _pipeline = Observable.Interval(TimeSpan.FromSeconds(30))
                .StartWith(0)
                .SubscribeOn(scheduler)
                .Select((_) => Observable.FromAsync(() => measuredGetter(RULESET_PATH)))
                .Do((_ )=> LastCheckTime = DateTime.UtcNow)
                .Switch()
                .Select(x => (label: String.Join("", x.Headers.GetValues("X-Rules-Version")), response: x))
                .DistinctUntilChanged()
                .Select(x => Observable.FromAsync(() => measuredDownloader(x.response))
                    .Select(rules => (label: x.label, rules: rules))
                )
                .Switch()
                .Catch((Exception exception) =>
                {
                    logger.LogWarning($"Failed to update rules: \r\n{exception}");
                    return Observable.Empty<(string label, Dictionary<string, RuleDefinition> rules)>()
                        .Delay(TimeSpan.FromMinutes(1));
                })
                .Repeat()
                .Do(_subject)
                .Do(x=> CurrentLabel = x.label)
                .Do(x => OnRulesChange?.Invoke(x.rules));
        }

        private void Start() => _subscrption = _pipeline.Subscribe();

        public static TweekManagementRulesDriver StartNew(HttpGet getter, ILogger logger = null,
            IMetrics metrics = null, IScheduler scheduler = null)
        {
            var driver = new TweekManagementRulesDriver(getter, logger,
                metrics, scheduler);
            driver.Start();
            return driver;
        }

        public async Task<Dictionary<string, RuleDefinition>> GetAllRules() => await _subject.Select(x => x.rules).FirstAsync();

        public async Task<string> GetLabel() => await _subject.Select(x => x.label).FirstAsync();

        public void Dispose()
        {
            _subscrption.Dispose();
        }
    }
}

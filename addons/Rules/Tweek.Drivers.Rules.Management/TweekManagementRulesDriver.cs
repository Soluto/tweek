using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Reactive.Concurrency;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Text;
using System.Threading.Tasks;
using App.Metrics;
using App.Metrics.Core.Abstractions;
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
        private readonly IConnectableObservable<Dictionary<string, RuleDefinition>> _pipeline;
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

        private static Func<T, Task<U>> MeasureAsync<T, U>(IMeasureMetrics metrics, string name, Func<T, Task<U>> mapFunc)
        {
            return Optional(metrics)
                .Match(someMetrics =>
                    async (T t) =>
                    {
                        using (someMetrics.Timer.Time(GetTimerOptions(name)))
                        {
                            return await mapFunc(t);
                        }
                    }, () => mapFunc);
        }

        private TweekManagementRulesDriver(HttpGet getter, ILogger logger = null, IMeasureMetrics metrics = null, IScheduler scheduler = null)
        {
            logger = logger ?? NullLogger.Instance;
            scheduler = scheduler ?? TaskPoolScheduler.Default;
            var measuredGetter = MeasureAsync<string, HttpResponseMessage>(metrics, "download_latest_header", s=>getter(s));
            var measuredDownloader = MeasureAsync(metrics, "download_ruleset", (HttpResponseMessage message)=> message.ExtractRules());

            _pipeline = Observable.Create<Dictionary<string, RuleDefinition>>( async (sub, ct)=>{
                    var shouldStop = false;
                    try {
                    string currentVersion = null;
                    while(!shouldStop){
                        {
                            var response = await measuredGetter(RULESET_PATH);
                            var newVersion = response.GetRulesVersion();
                            if (newVersion == currentVersion) {
                                await Task.Delay(30000);
                                continue;
                            }
                            currentVersion = newVersion;
                            var ruleset = await measuredDownloader(response);
                            CurrentLabel = newVersion;
                            await Task.Delay(5000);
                            sub.OnNext(ruleset);
                        }
                    }
                    } catch(Exception ex){
                        sub.OnError(ex);
                        shouldStop = true;
                    }
                    ct.Register(()=> shouldStop = true);
                    return ()=> shouldStop=true ;
                })
                .SubscribeOn(scheduler)
                .Catch((Exception exception) =>
                {
                    logger.LogWarning($"Failed to update rules: \r\n{exception}");
                    return Observable.Empty<Dictionary<string, RuleDefinition>>()
                        .Delay(TimeSpan.FromMinutes(1));
                })
                .Replay(1);
        }

        private void Start() => _subscrption = new CompositeDisposable(_pipeline.Subscribe(rules => OnRulesChange?.Invoke(rules)),_pipeline.Connect());

        public static TweekManagementRulesDriver StartNew(HttpGet getter, ILogger logger = null,
            IMeasureMetrics metrics = null, IScheduler scheduler = null)
        {
            var driver = new TweekManagementRulesDriver(getter, logger,
                metrics, scheduler);
            driver.Start();
            return driver;
        }

        public async Task<Dictionary<string, RuleDefinition>> GetAllRules() => await _pipeline.FirstAsync();

        public void Dispose()
        {
            _subscrption.Dispose();
        }
    }
}

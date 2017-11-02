using System;
using System.Collections.Generic;
using System.Reactive.Concurrency;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace Tweek.Drivers.Rules.Minio
{
    public class MinioRulesDriver : IRulesDriver, IDisposable
    {
        private readonly IDisposable _subscription;
        private readonly IConnectableObservable<Dictionary<string, RuleDefinition>> _pipeline;

        public MinioRulesDriver(IMinioClient minioClient, MinioRulesDriverSettings settings, ILogger logger = null, IScheduler scheduler = null)
        {
            logger = logger ?? NullLogger.Instance;
            scheduler = scheduler ?? DefaultScheduler.Instance;

            _pipeline = Observable.Timer(TimeSpan.Zero, settings.SampleInterval)
                .SelectMany(_ => Observable.FromAsync(minioClient.GetVersion))
                .Do(_ => LastCheckTime = scheduler.Now.UtcDateTime)
                .DistinctUntilChanged()
                .Do(x => logger.LogInformation($"New rules version detected {x}"))
                .Select(version => Observable.FromAsync(ct => minioClient.GetRuleset(version, ct)).Select(rules => new { version, rules }))
                .Switch()
                .Do(x => CurrentLabel = x.version)
                .Select(x => x.rules)
                .Do(_ => {}, e => logger.LogError(e, "Error while getting rules"))
                .OnErrorResumeNext(Observable.Empty<Dictionary<string, RuleDefinition>>().Delay(settings.FailureDelay))
                .Repeat()
                .SubscribeOn(scheduler)
                .Replay(1);

            _subscription = new CompositeDisposable(
                _pipeline.Subscribe(rules => OnRulesChange?.Invoke(rules)), 
                _pipeline.Connect()
                );
        }

        public event Action<IDictionary<string, RuleDefinition>> OnRulesChange;

        public async Task<Dictionary<string, RuleDefinition>> GetAllRules() => await _pipeline.FirstAsync();

        public string CurrentLabel { get; private set; }

        public DateTime LastCheckTime = DateTime.UtcNow;
        
        public void Dispose()
        {
            _subscription.Dispose();
        }
    }
}
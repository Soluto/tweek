using System;
using System.Collections.Generic;
using System.Reactive;
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

            _pipeline = Observable.Create<Dictionary<string, RuleDefinition>>(async (sub, ct) =>
                {
                    try
                    {
                        while (!ct.IsCancellationRequested)
                        {
                            var latestVersion = await minioClient.GetVersion(ct);
                            LastCheckTime = scheduler.Now.UtcDateTime;
                            if (latestVersion == CurrentLabel)
                            {
                                await Observable.Return(Unit.Default).Delay(settings.SampleInterval, scheduler);
                                continue;
                            }
                            var ruleset = await minioClient.GetRuleset(latestVersion, ct);
                            sub.OnNext(ruleset);
                            CurrentLabel = latestVersion;
                        }
                    }
                    catch (Exception ex)
                    {
                        sub.OnError(ex);
                    }
                })
                .SubscribeOn(scheduler)
                .Catch((Exception exception) =>
                {
                    logger.LogWarning(exception, "Failed to update rules");
                    return Observable.Empty<Dictionary<string, RuleDefinition>>()
                        .Delay(settings.FailureDelay);
                })
                .Repeat()
                .Replay(1);

            _subscription = new CompositeDisposable(
                _pipeline.Subscribe(rules => OnRulesChange?.Invoke(rules)), 
                _pipeline.Connect()
                );
        }

        public event Action<IDictionary<string, RuleDefinition>> OnRulesChange;

        public async Task<Dictionary<string, RuleDefinition>> GetAllRules() => await _pipeline.FirstAsync();

        public string CurrentLabel { get; private set; }

        public DateTime LastCheckTime = DateTime.MinValue;
        
        public void Dispose()
        {
            _subscription.Dispose();
        }
    }
}
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using System;
using System.Collections.Generic;
using System.Reactive.Concurrency;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Threading.Tasks;

namespace Tweek.Engine.Drivers.Rules
{
    public class RulesRepository : IRulesRepository, IDisposable
    {
        private readonly IDisposable _subscription;
        private readonly IConnectableObservable<Dictionary<string, RuleDefinition>> _pipeline;

        public RulesRepository(IRulesDriver rulesDriver, IRulesetVersionProvider versionProvider, TimeSpan failureDelay,
            TimeSpan maxWaitTimeout, ILogger logger = null, IScheduler scheduler = null)
        {
            logger = logger ?? NullLogger.Instance;
            scheduler = scheduler ?? DefaultScheduler.Instance;

            _pipeline = Observable.Defer(versionProvider.OnVersion)
                .Timeout(maxWaitTimeout)
                .Do(_ => LastCheckTime = scheduler.Now.UtcDateTime)
                .DistinctUntilChanged()
                .Do(version => logger.LogInformation($"Detected new rules version: {version}"))
                .Select(version => Observable.FromAsync(ct => rulesDriver.GetRuleset(version, ct)).Do(_ => CurrentLabel = version))
                .Switch()
                .Do(_ => logger.LogInformation("Updated rules"))
                .SubscribeOn(scheduler)
                .Catch((Exception exception) =>
                {
                    logger.LogWarning(exception, "Failed to update rules");
                    return Observable.Empty<Dictionary<string, RuleDefinition>>()
                        .Delay(failureDelay);
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

        public DateTime LastCheckTime { get; private set; } = DateTime.MinValue;

        public void Dispose()
        {
            _subscription.Dispose();
        }
    }
}
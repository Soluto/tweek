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
        private readonly IConnectableObservable<(string version, Dictionary<string, RuleDefinition> rules)> _pipeline;

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
                .Select(version => Observable.FromAsync(ct => rulesDriver.GetRuleset(version, ct))
                    .Select(rules => (version, rules)))
                .Switch()
                .Do(_ => logger.LogInformation("Updated rules"))
                .SubscribeOn(scheduler)
                .Catch((Exception exception) =>
                {
                    logger.LogWarning(exception, "Failed to update rules");
                    return Observable.Empty<(string, Dictionary<string, RuleDefinition>)>()
                        .Delay(failureDelay);
                })
                .Repeat()
                .Replay(1);

            _subscription = new CompositeDisposable(
                _pipeline.Subscribe(set =>
                {
                    try
                    {
                        OnRulesChange?.Invoke(set.rules);
                        CurrentLabel = set.version;
                        IsLatest = true;
                    }
                    catch (Exception ex)
                    {
                        IsLatest = false;
                        logger.LogCritical("failed to updated ruleset: {version}, {error}", CurrentLabel, ex);
                    }
                }),
                _pipeline.Connect()
            );
        }

        public event Action<IDictionary<string, RuleDefinition>> OnRulesChange;

        public async Task<Dictionary<string, RuleDefinition>> GetAllRules() => await _pipeline.Select(set => set.rules).FirstAsync();


        public string CurrentLabel { get; private set; }

        public DateTime LastCheckTime { get; private set; } = DateTime.MinValue;

        public bool IsLatest { get; private set; } = true;

        public void Dispose()
        {
            _subscription.Dispose();
        }
    }
}
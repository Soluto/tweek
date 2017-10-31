using System;
using System.Collections.Generic;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Threading.Tasks;
using Engine.Drivers.Rules;

namespace Tweek.Drivers.Rules.Minio
{
    public class MinioRulesDriver : IRulesDriver, IDisposable
    {
        private readonly IDisposable _subscription;
        private readonly IConnectableObservable<Dictionary<string, RuleDefinition>> _pipeline;

        public MinioRulesDriver(TweekMinioClient minioClient, MinioRulesDriverSettings settings)
        {
            _pipeline = Observable.Timer(TimeSpan.Zero, settings.SampleInterval)
                .SelectMany(_ => Observable.FromAsync(minioClient.GetVersion))
                .DistinctUntilChanged()
                .Select(version => Observable.FromAsync(ct => minioClient.GetRuleset(version, ct)).Select(rules => new { version, rules }))
                .Switch()
                .Do(x => CurrentLabel = x.version)
                .Select(x => x.rules)
                .OnErrorResumeNext(Observable.Empty<Dictionary<string, RuleDefinition>>().Delay(settings.SampleInterval))
                .Repeat()
                .Replay(1);

            _subscription = new CompositeDisposable(_pipeline.Subscribe(rules => OnRulesChange?.Invoke(rules)),
                _pipeline.Connect());
        }

        public event Action<IDictionary<string, RuleDefinition>> OnRulesChange;

        public async Task<Dictionary<string, RuleDefinition>> GetAllRules() => await _pipeline.FirstAsync();

        public string CurrentLabel { get; private set; }

        public void Dispose()
        {
            _subscription.Dispose();
        }
    }
}
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Reactive.Concurrency;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Newtonsoft.Json;
using System.Text;

namespace Tweek.Drivers.Blob
{
    public class BlobRulesDriver : IRulesDriver, IDisposable
    {
        private readonly Uri _url;
        private readonly ISubject<Dictionary<string, RuleDefinition>> _subject;
        private readonly IDisposable _subscription;

        public BlobRulesDriver(Uri url, IWebClientFactory webClientFactory, IScheduler scheduler = null)
        {
            _url = url;
            _subject = new ReplaySubject<Dictionary<string, RuleDefinition>>(1);
            scheduler = scheduler ?? TaskPoolScheduler.Default;
            _subscription = Observable.Interval(TimeSpan.FromSeconds(30))
                .StartWith(0)
                .SubscribeOn(scheduler)
                .Select((_)=>Observable.FromAsync(async () =>
                {
                    using (var client = webClientFactory.Create())
                    {
                        client.Encoding = Encoding.UTF8;
                        return await client.DownloadStringTaskAsync(_url);
                    }
                }))
                .Switch()
                .DistinctUntilChanged()
                .Do(x => CurrentLabel = x.GetHashCode().ToString())
                .Select(JsonConvert.DeserializeObject<Dictionary<string, RuleDefinition>>)
                .DistinctUntilChanged(new DictionaryEqualityComparer<string, RuleDefinition>(new RuleDefinitionComparer()))
                .Catch((Exception exception) =>
                {
                    //Trace.TraceWarning($"Failed to update rules from {url}\r\n{exception}");
                    return Observable.Empty<Dictionary<string, RuleDefinition>>().Delay(TimeSpan.FromMinutes(1));
                })
                .Repeat()
                .Do(_subject)
                .Subscribe(x => OnRulesChange?.Invoke(x));
        }

        public event Action<IDictionary<string, RuleDefinition>> OnRulesChange;

        public async Task<Dictionary<string, RuleDefinition>> GetAllRules()
        {
            return await _subject.FirstAsync();
        }

        public string CurrentLabel { get; private set; }

        public void Dispose()
        {
            _subscription?.Dispose();
        }
    }
}

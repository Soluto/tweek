using System;
using System.Collections.Generic;
using System.Net;
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
        private IDisposable _subscription;

        public BlobRulesDriver(Uri url, IWebClientFactory webClientFactory)
        {
            _url = url;
            _subject = new ReplaySubject<Dictionary<string, RuleDefinition>>(1);

            _subscription = Observable.Interval(TimeSpan.FromSeconds(30))
                .StartWith(0)
                .SelectMany(async _ =>
                {
                    using (var client = webClientFactory.Create())
                    {
                        client.Encoding = Encoding.UTF8;

                        return await client.DownloadStringTaskAsync(_url);
                    }
                })
                .DistinctUntilChanged()
                .Select(JsonConvert.DeserializeObject<Dictionary<string, RuleDefinition>>)
                .Catch((Exception exception) =>
                {
                    //Log.Error("Failed to create engine with updated ruleset", exception, new Dictionary<string, object> { { "RoleName", "TweekApi" } });
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

        public void Dispose()
        {
            _subscription?.Dispose();
        }
    }
}

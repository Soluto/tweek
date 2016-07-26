using System;
using System.Collections.Generic;
using System.Net;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Newtonsoft.Json;

namespace Tweek.Drivers.Blob
{
    public class BlobRulesDriver : IRulesDriver, IDisposable
    {
        private readonly Uri _url;
        private readonly ISubject<Dictionary<string, RuleDefinition>> _subject;
        private IDisposable _subscription;

        public BlobRulesDriver(Uri url)
        {
            _url = url;
            _subject = new ReplaySubject<Dictionary<string, RuleDefinition>>(1);

            _subscription = Observable.Interval(TimeSpan.FromSeconds(120))
                .StartWith(0)
                .SelectMany(async _ =>
                {
                    using (var client = new WebClient())
                    {
                        return await client.DownloadStringTaskAsync(_url);
                    }
                })
                .DistinctUntilChanged()
                .Select(Regex.Unescape)
                .Select(x => x.Trim('"'))
                .Select(JsonConvert.DeserializeObject<Dictionary<string, RuleDefinition>>)
                .Do(x => OnRulesChange?.Invoke())
                .Catch((Exception exception) =>
                {
                    //Log.Error("Failed to create engine with updated ruleset", exception, new Dictionary<string, object> { { "RoleName", "TweekApi" } });
                    return Observable.Empty<Dictionary<string, RuleDefinition>>();
                })
                .Repeat()
                .Subscribe(_subject);
        }

        public event Action OnRulesChange;

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

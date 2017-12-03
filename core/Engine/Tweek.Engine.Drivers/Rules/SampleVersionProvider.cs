using System;
using System.Reactive.Linq;

namespace Tweek.Engine.Drivers.Rules
{
    public class SampleVersionProvider : IRulesetVersionProvider
    {
        private readonly TimeSpan _sampleInterval;
        private readonly IRulesDriver _rulesDriver;

        public SampleVersionProvider(IRulesDriver rulesDriver, TimeSpan sampleInterval)
        {
            _rulesDriver = rulesDriver;
            _sampleInterval = sampleInterval;
        }

        public IObservable<string> OnVersion()
        {
            return Observable.FromAsync(_rulesDriver.GetVersion)
                .Concat(Observable.Empty<string>().Delay(_sampleInterval))
                .Repeat();
        }
    }
}

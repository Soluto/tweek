using System;
using System.Reactive.Linq;

namespace Tweek.Engine.Drivers.Rules
{
    public class SampleVersionProvider : IRulesetVersionProvider
    {
        private readonly TimeSpan _sampleInterval;
        private readonly IRulesDriver _RulesDriver;

        public SampleVersionProvider(IRulesDriver rulesDriver, TimeSpan sampleInterval)
        {
            _RulesDriver = rulesDriver;
            _sampleInterval = sampleInterval;
        }

        public IObservable<string> OnVersion()
        {
            return Observable.FromAsync(_RulesDriver.GetVersion)
                .Concat(Observable.Empty<string>().Delay(_sampleInterval))
                .Repeat();
        }
    }
}

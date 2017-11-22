using System;
using System.Reactive.Linq;
using System.Text;
using NATS.Client;

namespace Tweek.Engine.Drivers.Rules
{
    public class NatsVersionProvider: IRulesetVersionProvider, IDisposable
    {
        private readonly IRulesDriver _rulesDriver;
        private readonly IConnection _nats;

        public NatsVersionProvider(IRulesDriver rulesDriver, string natsEndpoint)
        {
            _rulesDriver = rulesDriver;
            _nats = new ConnectionFactory().CreateConnection(natsEndpoint);
        }

        public IObservable<string> OnVersion()
        {
            return Observable.FromAsync(_rulesDriver.GetVersion)
                .Concat(Observable.Create<string>(obs => _nats.SubscribeAsync("version",
                    (_, e) => obs.OnNext(Encoding.UTF8.GetString(e.Message.Data)))));
        }

        public void Dispose() => _nats.Dispose();
    }
}

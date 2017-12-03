using System;
using System.Reactive.Linq;
using System.Text;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using NATS.Client;

namespace Tweek.Engine.Drivers.Rules
{
    public class NatsVersionProvider: IRulesetVersionProvider
    {
        private readonly IRulesDriver _rulesDriver;
        private readonly string _natsEndpoint;
        private readonly ILogger _logger;

        public NatsVersionProvider(IRulesDriver rulesDriver, string natsEndpoint, ILogger logger = null)
        {
            _rulesDriver = rulesDriver;
            _natsEndpoint = natsEndpoint;
            _logger = logger ?? NullLogger.Instance;
        }

        public IObservable<string> OnVersion()
        {
            var connection = Observable.Create<IConnection>(observer =>
            {
                var options = ConnectionFactory.GetDefaultOptions();
                options.Url = _natsEndpoint;
                options.Name = "Tweek API";
                options.AsyncErrorEventHandler += (s, args) =>
                {
                    _logger.LogError($"[NATS] connection error: {args.Error}");
                    observer.OnError(new Exception(args.Error));
                };
                options.ClosedEventHandler += (s, a) =>
                {
                    _logger.LogWarning("[NATS] connection closed");
                    observer.OnCompleted();
                };
                var nats = new ConnectionFactory().CreateConnection(options);
                _logger.LogInformation("[NATS] connected");
                observer.OnNext(nats);
                return nats;
            });

            var subscription = connection.SelectMany(nats =>
            {
                return Observable.Create<string>(observer =>
                {
                    return nats.SubscribeAsync("version", (_, e) =>
                    {
                        var version = Encoding.UTF8.GetString(e.Message.Data);
                        observer.OnNext(version);
                    });
                });
            });

            return Observable.FromAsync(_rulesDriver.GetVersion)
                .Concat(subscription);
        }
    }
}

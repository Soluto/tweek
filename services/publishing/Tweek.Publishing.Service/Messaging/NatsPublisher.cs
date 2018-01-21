using System;
using System.Reactive.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using NATS.Client;

namespace Tweek.Publishing.Service.Messaging
{
    public class NatsPublisher
    {
        private readonly ILogger _logger;

        private string _subject { get; }

        private Lazy<IConnection> _connectionInit;

        private IConnection Connection => _connectionInit.Value;

        public NatsPublisher(string natsEndpoint, string subject, ILogger logger = null){
            _logger = logger ?? NullLogger.Instance;
            _subject = subject;
            var options = ConnectionFactory.GetDefaultOptions();
            options.AllowReconnect = true;
            options.Servers = new []{
                natsEndpoint
            };
            options.Name = "Tweek Publishing";
            _connectionInit = new Lazy<IConnection>( () => { 
               return new ConnectionFactory().CreateConnection(options); 
            });
        }

        public async Task Publish(string message){
            await Task.Run(()=> Connection.Publish(_subject, Encoding.UTF8.GetBytes(message)));
        }
    }
}
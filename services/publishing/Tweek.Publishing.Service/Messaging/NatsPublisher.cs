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

        private Lazy<IConnection>  _connection;

        private Options _connectionOptions;

        private IConnection Connection{
            get {
                if (_connection == null || _connection.Value.IsClosed()) {
                    _connection = new Lazy<IConnection>(()=>new ConnectionFactory().CreateConnection(_connectionOptions));
                }
                return _connection.Value;
            }
        }

        public NatsPublisher(string natsEndpoint, string subject, ILogger logger = null){
            _logger = logger ?? NullLogger.Instance;
            _subject = subject;
            _connectionOptions = ConnectionFactory.GetDefaultOptions();
            _connectionOptions.AllowReconnect = true;
            _connectionOptions.Servers = new []{
                natsEndpoint
            };
            _connectionOptions.Name = "Tweek Publishing";
        }

        public async Task Publish(string message){
            await Task.Run(()=> Connection.Publish(_subject, Encoding.UTF8.GetBytes(message)));
        }
    }
}
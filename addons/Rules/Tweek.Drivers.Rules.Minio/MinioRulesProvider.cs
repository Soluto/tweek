using System;
using System.Collections.Generic;
using System.IO;
using System.Reactive.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Minio;
using NATS.Client;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Tweek.Drivers.Rules.Minio
{
    public class MinioRulesProvider : IRulesProvider, IDisposable
    {
        private readonly MinioClient _client;
        private readonly string _bucket;
        private readonly IConnection _nats;

        public MinioRulesProvider(MinioSettings minioSettings, string natsEndpoint)
        {
            _bucket = minioSettings.Bucket;
            _client = new MinioClient(minioSettings.Endpoint, minioSettings.AccessKey, minioSettings.SecretKey);
            if (minioSettings.IsSecure)
            {
                _client = _client.WithSSL();
            }

            _nats = new ConnectionFactory().CreateConnection(natsEndpoint);
        }

        public IObservable<string> OnVersion()
        {
            return Observable.FromAsync(GetVersion)
                .Concat(Observable.Create<string>(obs => _nats.SubscribeAsync("version",
                    (_, e) => obs.OnNext(Encoding.UTF8.GetString(e.Message.Data)))));
        }
        

        public async Task<Dictionary<string, RuleDefinition>> GetRuleset(string version,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            var json = await GetObject(version, cancellationToken);
            return JsonConvert.DeserializeObject<Dictionary<string, RuleDefinition>>(json);
        }

        public async Task<string> GetVersion(CancellationToken cancellationToken = default(CancellationToken))
        {
            var json = await GetObject("versions", cancellationToken);
            var versions = JObject.Parse(json);
            return versions["latest"].Value<string>();
        }

        private async Task<string> GetObject(string objectName, CancellationToken cancellationToken)
        {
            var json = "";
            await _client.GetObjectAsync(_bucket, objectName, stream =>
            {
                using (var streamReader = new StreamReader(stream))
                {
                    json = streamReader.ReadToEnd();
                }
            }, cancellationToken);
            return json;
        }

        public void Dispose() => _nats.Dispose();
    }
}

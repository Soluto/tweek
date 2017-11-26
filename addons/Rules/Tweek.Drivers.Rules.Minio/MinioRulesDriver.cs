using Minio;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Tweek.Engine.Drivers.Rules;

namespace Tweek.Drivers.Rules.Minio
{
    public class MinioRulesDriver : IRulesDriver
    {
        private readonly MinioClient _client;
        private readonly string _bucket;

        public MinioRulesDriver(MinioSettings minioSettings)
        {
            _bucket = minioSettings.Bucket;
            _client = new MinioClient(minioSettings.Endpoint, minioSettings.AccessKey, minioSettings.SecretKey);
            if (minioSettings.IsSecure)
            {
                _client = _client.WithSSL();
            }
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
            string json = null;
            await _client.GetObjectAsync(_bucket, objectName, stream =>
            {
                using (var streamReader = new StreamReader(stream))
                {
                    json = streamReader.ReadToEnd();
                }
            }, cancellationToken);
            return json;
        }
    }
}

using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Minio;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Tweek.Drivers.Rules.Minio
{
    public class TweekMinioClient
    {
        private readonly MinioClient _client;
        private readonly string _bucket;
        public TweekMinioClient(string bucket, string endpoint, string accessKey, string secretKey, bool isSecure)
        {
            _bucket = bucket;
            _client = new MinioClient(endpoint, accessKey, secretKey);
            if (isSecure)
            {
                _client = _client.WithSSL();
            }
        }

        public async Task<string> GetVersion(CancellationToken cancellationToken = default(CancellationToken))
        {
            var json = await GetObject("versions", cancellationToken);
            var versions = JObject.Parse(json);
            return versions["latest"].Value<string>();
        }

        public async Task<Dictionary<string, RuleDefinition>> GetRuleset(string version,
            CancellationToken cancellationToken = default(CancellationToken))
        {
            var json = await GetObject(version, cancellationToken);
            return JsonConvert.DeserializeObject<Dictionary<string, RuleDefinition>>(json);
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
    }
}

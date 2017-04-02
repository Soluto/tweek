using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using FSharpUtils.Newtonsoft;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using RestEase;
using Tweek.Utils;

namespace Tweek.ApiService.SmokeTests
{
    public class TweekApi : ITweekApi
    {
        private HttpClient _client;

        public TweekApi(HttpClient client)
        {
            this._client = client;
        }

        public async Task AppendContext(string identityType, string identityId, Dictionary<string, JsonValue> context)
        {
            await _client.PostAsync(
                $"http://localhost:5000/context/{identityType}/{identityId}", new StringContent(JsonConvert.SerializeObject(context, new JsonValueConverter()), Encoding.UTF8, "application/json"));
        }

        public async Task<JToken> GetConfigurations(string keyPath, IEnumerable<KeyValuePair<string, string>> context)
        {
            var stream = await _client.GetStreamAsync(
                $"http://localhost:5000/configurations/{keyPath}?{String.Join("&", context.Select(x => String.Join("=", x.Key, x.Value)))}");

            return JToken.Load(new JsonTextReader(new StreamReader(stream)));
        }
    }

    public static class TweekApiServiceFactory
    {
        public static ITweekApi GetTweekApiClient()
        {
            return new TweekApi(new HttpClient()
            {
                BaseAddress = new Uri("http://localhost:5000")
            });
        }
    }
}

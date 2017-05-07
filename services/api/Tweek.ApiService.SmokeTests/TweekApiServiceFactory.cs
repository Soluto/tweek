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
using Tweek.Utils;

namespace Tweek.ApiService.SmokeTests
{
    public class TweekApi : ITweekApi
    {
        private readonly HttpClient _client;

        public TweekApi(HttpClient client)
        {
            _client = client;
        }

        public async Task AppendContext(string identityType, string identityId, Dictionary<string, JsonValue> context)
        {
            await _client.PostAsync(
                $"/context/{identityType}/{identityId}", new StringContent(JsonConvert.SerializeObject(context, new JsonValueConverter()), Encoding.UTF8, "application/json"));
        }

        public async Task<JToken> GetConfigurations(string keyPath, IEnumerable<KeyValuePair<string, string>> context)
        {
            var stream = await _client.GetStreamAsync(
                $"/configurations/{keyPath}?{string.Join("&", context.Select(x => String.Join("=", x.Key, x.Value)))}");

            return JToken.Load(new JsonTextReader(new StreamReader(stream)));
        }
    }

    public static class TweekApiServiceFactory
    {
        public static ITweekApi GetTweekApiClient()
        {
            var baseUrl = Environment.GetEnvironmentVariable("TWEEK_API_URL") ?? "http://localhost:5000";
            return new TweekApi(new HttpClient
            {
                BaseAddress = new Uri(baseUrl)
            });
        }
    }
}

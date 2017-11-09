using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using FSharpUtils.Newtonsoft;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Tweek.Utils;
using Xunit.Abstractions;

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
                $"/api/v1/context/{identityType}/{identityId}", new StringContent(JsonConvert.SerializeObject(context, new JsonValueConverter()), Encoding.UTF8, "application/json"));
        }

        public async Task RemoveFromContext(string identityType, string identityId, string property)
        {
            await _client.DeleteAsync($"/api/v1/context/{identityType}/{identityId}/{property}");
        }

        public Task<string> GetRepositoryVersion()
        {
            return _client.GetStringAsync("api/v1/repo-version");
        }

        public async Task<JToken> GetSwagger()
        {
            var stream = await _client.GetStreamAsync("/api/swagger.json");

            return JToken.Load(new JsonTextReader(new StreamReader(stream)));
        }

        public async Task<JToken> GetConfigurations(string keyPath, IEnumerable<KeyValuePair<string, string>> context)
        {
            var stream = await _client.GetStreamAsync(
                $"api/v1/keys/{keyPath}?{string.Join("&", context.Select(x => string.Join("=", x.Key, x.Value)))}");

            return JToken.Load(new JsonTextReader(new StreamReader(stream)));
        }

        public async Task<HttpResponseMessage> GetCorsPreflightResponse(string origin, string method)
        {
            var request = new HttpRequestMessage(HttpMethod.Options, $"api/v1/keys/");
            request.Headers.Add("Access-Control-Request-Method", method);
            request.Headers.Add("Origin", origin);
            return await _client.SendAsync(request);
        }
    }

    public static class TweekApiServiceFactory
    {
        public static ITweekApi GetTweekApiClient(ITestOutputHelper output)
        {
            var baseUrl = Environment.GetEnvironmentVariable("TWEEK_API_URL") ?? "http://localhost:4003";
            var proxyUrl = Environment.GetEnvironmentVariable("PROXY_URL");
            var handler = new HttpClientHandler();

            if (proxyUrl != null)
            {
                handler.Proxy = new WebProxy(proxyUrl, false);
            }

            output.WriteLine($"TWEEK_API_URL {baseUrl}");

            var client = new HttpClient(handler);
            client.BaseAddress = new Uri(baseUrl);
            return new TweekApi(client);
        }
    }
}

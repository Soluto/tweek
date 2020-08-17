using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using RestEase;
using FSharpUtils.Newtonsoft;

namespace Tweek.ApiService.SmokeTests
{
    public interface ITweekApi
    {
        [Get("api/v1/keys/{keyPath}")]
        Task<JToken> GetConfigurations([Path] string keyPath,[QueryMap] IEnumerable<KeyValuePair<string, string>> context);

        Task<HttpResponseMessage> AppendContext([Path] string identityType, [Path]string identityId, Dictionary<string, JsonValue> context);

        Task RemoveFromContext([Path] string identityType, [Path]string identityId, string property);

        [Get("/api/v1/repo-version")]
        Task<string> GetRepositoryVersion();

        [Options("")]
        Task<HttpResponseMessage> GetCorsPreflightResponse(string origin, string method);
    }
}

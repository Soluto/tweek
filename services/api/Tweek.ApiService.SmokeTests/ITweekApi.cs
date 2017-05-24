using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using RestEase;
using FSharpUtils.Newtonsoft;

namespace Tweek.ApiService.SmokeTests
{
    public interface ITweekApi
    {
        [Get("configurations/{keyPath}")]
        Task<JToken> GetConfigurations([Path] string keyPath,[QueryMap] IEnumerable<KeyValuePair<string, string>> context);

        Task AppendContext([Path] string identityType, [Path]string identityId, Dictionary<string, JsonValue> context);

        [Post("validation")]
        Task<string> Validate([Body] Dictionary<string, RuleDefinition> ruleset);

        [Get("/api/swagger.json")]
        Task<JToken> GetSwagger();
    }
}

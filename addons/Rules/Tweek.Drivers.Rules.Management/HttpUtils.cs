using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Tweek.Engine.Drivers.Rules;

namespace Tweek.Drivers.Rules.Management
{
    public delegate Task<HttpResponseMessage> HttpGet(string url);

    static class HttpUtils
    {
        public static string GetRulesVersion(this HttpResponseMessage message) =>
            message.Headers.GetValues("X-Rules-Version").Single();

        public static async Task<Dictionary<string, RuleDefinition>> ExtractRules(this HttpResponseMessage response)
        {
            return JsonConvert.DeserializeObject<Dictionary<string, RuleDefinition>>(
                Encoding.UTF8.GetString(await response.Content.ReadAsByteArrayAsync()));
        }
    }
}
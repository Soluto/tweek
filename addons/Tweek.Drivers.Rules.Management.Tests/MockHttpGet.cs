using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Newtonsoft.Json;

namespace Tweek.Drivers.Rules.Management.Tests
{
    public class MockHttpGet
    {
        public int Version { get; set; }
        public Dictionary<string, RuleDefinition> Rules { get; set; }

        public MockHttpGet()
        {
            Version = default(int);
            Rules = default(Dictionary<string, RuleDefinition>);
        }

        public Task<HttpResponseMessage> HttpGet(string url)
        {
            if (url == "/ruleset/latest/version")
            {
                return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
                {
                    Content = new StringContent(Version.ToString())
                });
            }
            if (url == "/ruleset/latest")
            {
                return Task.FromResult(new HttpResponseMessage
                {
                    Headers = {{"X-Rules-Version", new[] {Version.ToString()}}},
                    Content = new StringContent(JsonConvert.SerializeObject(Rules))
                });
            }
            return Task.FromResult(new HttpResponseMessage(HttpStatusCode.BadRequest));
        }
    }
}
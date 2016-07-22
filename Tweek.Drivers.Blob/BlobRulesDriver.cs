using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Newtonsoft.Json;

namespace Tweek.Drivers.Blob
{
    public class BlobRulesDriver : IRulesDriver
    {
        private readonly Uri _url;

        public BlobRulesDriver(Uri url)
        {
            _url = url;
        }

        public async Task<Dictionary<string, RuleDefinition>> GetAllRules()
        {
            using (var client = new WebClient())
            {
                try
                {
                    var rawRuleset = await client.DownloadStringTaskAsync(_url);
                    var cleanRuleset = Regex.Unescape(rawRuleset).Trim('"');
                    var ruleset = JsonConvert.DeserializeObject<Dictionary<string, RuleDefinition>>(cleanRuleset);
                    return ruleset;
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    return null;
                }
            }
        }
    }
}

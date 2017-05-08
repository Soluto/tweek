using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Newtonsoft.Json;

namespace Tweek.Drivers.Rules.Management{
  
  public delegate Task<HttpResponseMessage> HttpGet(string url);
  static class HttpUtils {
      public static HttpGet FromHttpClient(HttpClient client){
          return client.GetAsync;
      }
      
      public static string GetRulesVersion(this HttpResponseMessage message)
      {
          return String.Join("", message.Headers.GetValues("X-Rules-Version"));
      }

      public static async Task<Dictionary<string, RuleDefinition>> ExtractRules(this HttpResponseMessage response)
      {
          return JsonConvert.DeserializeObject<Dictionary<string, RuleDefinition>>(
              Encoding.UTF8.GetString(await response.Content.ReadAsByteArrayAsync()));
      }
    }
}
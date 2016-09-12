using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using RestEase;

namespace Tweek.ApiService.SmokeTests
{
    public interface ITweekApi
    {
        [Get("configurations/{keyPath}")]
        Task<JToken> GetConfigurations([Path] string keyPath,[QueryMap] Dictionary<string, string> context);
    }
}

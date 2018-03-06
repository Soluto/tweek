using System.Collections.Generic;
using Newtonsoft.Json;

namespace Tweek.Publishing.Service.Model.ExternalApps
{
    public class ExternalApp
    {
        [JsonProperty("name")]
        public string Name;

        [JsonProperty("version")]
        public string Version;

        [JsonProperty("secretKeys")]
        public IEnumerable<SecretKey> SecretKeys;
    }
}
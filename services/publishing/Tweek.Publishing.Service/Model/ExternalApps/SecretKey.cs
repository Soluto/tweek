using System.Collections.Generic;
using Newtonsoft.Json;

namespace Tweek.Publishing.Service.Model.ExternalApps
{
    public class SecretKey
    {
        [JsonProperty("salt")]
        public string Salt;

        [JsonProperty("hash")]
        public string Hash;

        [JsonProperty("creationDate")]
        public string CreationDate;
    }
}
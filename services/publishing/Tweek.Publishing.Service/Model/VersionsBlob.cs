using Newtonsoft.Json;

namespace Tweek.Publishing.Service.Model
{
    public class VersionsBlob
    {
        [JsonProperty("latest")]
        public string Latest;

        [JsonProperty("previous")]
        public string Previous;
    }
}
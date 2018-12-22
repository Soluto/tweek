using Newtonsoft.Json;

namespace Tweek.Publishing.Service.Model.Rules
{
    public class KeyDef
    {
        [JsonProperty("payload")]
        public string Payload;

        [JsonProperty("dependencies")]
        public string[] Dependencies;

        [JsonProperty("format")]
        public string Format;
    }
}
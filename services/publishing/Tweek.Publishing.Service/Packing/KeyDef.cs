using Newtonsoft.Json;

namespace Tweek.Publishing.Service.Packing
{
  public class KeyDef {
        [JsonProperty("payload")]
        public string Payload;
        [JsonProperty("dependencies")]
        public string[] Dependencies;
        [JsonProperty("format")]
        public string Format;
    }
}
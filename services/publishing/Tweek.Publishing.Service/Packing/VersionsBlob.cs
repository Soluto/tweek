using Newtonsoft.Json;

namespace Tweek.Publishing.Service.Packing
{
  public class VersionsBlob
  {
    [JsonProperty("latest")]
    public string Latest;
    [JsonProperty("previous")]
    public string Previous;
  }
}
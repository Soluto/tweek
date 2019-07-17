using Newtonsoft.Json;

namespace Tweek.Publishing.Service.Model.Hooks {
  public class Hook {
    [JsonProperty("type")]
    public string Type { get; }
    [JsonProperty("url")]
    public string Url { get; }

    public Hook(string type, string url) {
      this.Type = type;
      this.Url = url;
    }

    public override bool Equals(object obj) {
      if (obj == null || this.GetType() != obj.GetType()) return false;
      
      var otherHook = (Hook)obj;
      return this.Type == otherHook.Type && this.Url == otherHook.Url;
    }

    public override int GetHashCode() {
      return $"{Type}-${Url}".GetHashCode();
    }
  }
}
using System.Text.RegularExpressions;
using System.Linq;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace Tweek.Publishing.Service.Model.Hooks {
  public class Hook {
    [JsonProperty("id")]
    public string Id { get; }
    [JsonProperty("keyPath")]
    public string KeyPath { get; }
    [JsonProperty("type")]
    public string Type { get; }
    [JsonProperty("url")]
    public string Url { get; }
    private readonly Regex _matchingKeyRegex;

    public Hook(string id, string keyPath, string type, string url) {
      this.Id = id;
      this.KeyPath = keyPath;
      this.Type = type;
      this.Url = url;

      var keyPathForRegex = this.KeyPath.Replace("*", ".*");
      this._matchingKeyRegex = new Regex($"^{keyPathForRegex}$", RegexOptions.Compiled);
    }

    public bool MatchesKeyPath(string keyPath) => _matchingKeyRegex.IsMatch(keyPath);

    public IEnumerable<string> GetMatchingKeyPaths(IEnumerable<string> keyPaths) {
      return keyPaths.Where( keyPath => MatchesKeyPath(keyPath) );
    }

    public override bool Equals(object obj) {
      if (obj == null || this.GetType() != obj.GetType()) return false;
      
      var otherHook = (Hook)obj;
      return Id == otherHook.Id;
    }

    public override int GetHashCode() {
      return Id.GetHashCode();
    }
  }
}
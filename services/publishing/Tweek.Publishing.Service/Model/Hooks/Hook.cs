using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
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
      Id = id;
      KeyPath = keyPath;
      Type = type;
      Url = url;

      var keyPathForRegex = KeyPath.Replace("*", ".*");
      _matchingKeyRegex = new Regex($"^{keyPathForRegex}$", RegexOptions.Compiled);
    }

    public bool MatchesKeyPath(string keyPath) => _matchingKeyRegex.IsMatch(keyPath);

    public IEnumerable<string> GetMatchingKeyPaths(IEnumerable<string> keyPaths) => keyPaths.Where(MatchesKeyPath);

    public override bool Equals(object obj) {
      if (obj == null || GetType() != obj.GetType()) return false;
      
      var otherHook = (Hook)obj;
      return Id == otherHook.Id;
    }

    public override int GetHashCode() => Id.GetHashCode();
  }
}
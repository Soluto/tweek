using System.Text;
using System.Net.Http;
using System.Threading.Tasks;
using System;
using Tweek.Publishing.Service.Utils;
using Newtonsoft.Json;

namespace Tweek.Publishing.Service.Model.Hooks {
  public class Hook {
    [JsonProperty("type")]
    private string _type;
    [JsonProperty("url")]
    private string _url;

    public Hook(string type, string url) {
      this._type = type;
      this._url = url;
    }

    public async Task trigger(string payload) {
      switch (_type) {
        case "notification_webhook":
          await triggerNotificationWebhook(payload);
          break;
        default:
          throw new Exception($"Failed to trigger hook, invalid type: {_type}");
      }
    }

    private async Task triggerNotificationWebhook(string payload) {
      var qq = new StringContent(payload, Encoding.UTF8, "application/json");
      var response = await Http.getClient().PostAsync(_url, new StringContent(payload, Encoding.UTF8, "application/json"));
      response.EnsureSuccessStatusCode();
    }

    public override bool Equals(object obj) {
      if (obj == null || this.GetType() != obj.GetType()) return false;
      
      var otherHook = (Hook)obj;
      return this._type == otherHook._type && this._url == otherHook._url;
    }

    public override int GetHashCode() {
      unchecked {
          const int HashingBase = (int) 2166136261;
          const int HashingMultiplier = 16777619;

          var hash = HashingBase;
          hash = (hash * HashingMultiplier) ^ (!Object.ReferenceEquals(null, _type) ? _type.GetHashCode() : 0);
          hash = (hash * HashingMultiplier) ^ (!Object.ReferenceEquals(null, _url) ? _url.GetHashCode() : 0);
          return hash;
      }
    }
  }
}
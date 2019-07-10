using System.Net.Http;

namespace Tweek.Publishing.Service.Utils {
  public static class Http {
    private static HttpClient _client;

    public static void Initialize(HttpClient client) {
      Http._client = client;
    }

    public static HttpClient GetClient() {
      return _client;
    }
  }
}
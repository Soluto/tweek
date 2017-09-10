using FSharpUtils.Newtonsoft;
using Newtonsoft.Json;

namespace Tweek.Utils {
    public static class JsonValueExtensions{
        public static T Deserialize<T>(this JsonValue json)
        {
            return JsonConvert.DeserializeObject<T> (
              JsonConvert.SerializeObject(json, new []{new JsonValueConverter()}));
        }
    }
}
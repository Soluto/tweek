using FSharpUtils.Newtonsoft;
using LanguageExt;
using static LanguageExt.Prelude;

namespace Tweek.Engine.Drivers {
    public static class JsonValueExtensions 
    {
        public static Option<JsonValue> GetPropertyOption(this JsonValue json, string propName)
        {
            var prop = json.TryGetProperty(propName);
            return Optional(prop?.Value);
        }
    }
}
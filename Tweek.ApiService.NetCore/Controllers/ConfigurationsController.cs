using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LanguageExt;
using Tweek.ApiService.Utils;
using Engine.DataTypes;
using FSharpUtils.Newtonsoft;
using static FSharpUtils.Newtonsoft.JsonValue;
using Engine.Core.Context;
using Engine;
using Engine.Core.Utils;
using Newtonsoft.Json;
using Tweek.Utils;

namespace Tweek.ApiService.NetCore.Controllers
{
    [Route("configurations")]
    public class ConfigurationsController : Controller
    {
        private ITweek _tweek;

        public ConfigurationsController(ITweek tweek)
        {
            this._tweek = tweek;
        }

        public static Tuple<IReadOnlyDictionary<TKey, TValue>, IReadOnlyDictionary<TKey, TValue>> PartitionByKey<TKey, TValue>(IDictionary<TKey, TValue> source,
            Predicate<TKey> predicate)
        {
            IReadOnlyDictionary<bool, IReadOnlyDictionary<TKey, TValue>> dict = source.GroupBy(x => predicate(x.Key))
                .ToDictionary(p => p.Key, p => (IReadOnlyDictionary<TKey, TValue>)p.ToDictionary(x => x.Key, x => x.Value));

            return Tuple.Create(dict.TryGetValue(true).IfNone(new Dictionary<TKey, TValue>()),
                                dict.TryGetValue(false).IfNone(new Dictionary<TKey, TValue>()));
        }

        private static object TranslateValueToString(ConfigurationValue v)
            =>
                (v.Value.IsRecord || v.Value.IsArray)
                    ? JsonConvert.SerializeObject(v.Value, JsonValueConverter.Instance)
                    : v.Value.AsString();

        [HttpGet("{*path}")]
        public async Task<ActionResult> GetAsync([FromRoute] string path)
        {
            var allParams = PartitionByKey(HttpContext.Request.Query.ToDictionary(x => x.Key, x => x.Value), x => x.StartsWith("$"));
            var modifiers = allParams.Item1;
            var isFlatten = modifiers.TryGetValue("$flatten").Select(x => bool.Parse(x.ToString())).IfNone(false);
            var ignoreKeyTypes = modifiers.TryGetValue("$ignoreKeyTypes").Select(x => bool.Parse(x.ToString())).IfNone(true);
            var translateValue = ignoreKeyTypes ? (TranslateValue)TranslateValueToString : (x => x.Value);

            IReadOnlyDictionary<string, JsonValue> contextParams = allParams.Item2.ToDictionary(x => x.Key,
                x => NewString(x.Value.ToString()), StringComparer.OrdinalIgnoreCase);

            var identities = new HashSet<Identity>(contextParams.Where(x => !x.Key.Contains(".")).Select(x => new Identity(x.Key, x.Value.AsString())));

            GetLoadedContextByIdentityType contextProps =
                identityType => key => contextParams.TryGetValue($"{identityType}.{key}");

            if (path == null)
            {
                var includedPaths = HttpContext.Request.Query["$include"];

                if (includedPaths.Count == 0)
                    return StatusCode(400, "No paths were requested, request a path in the url or use $include query parameters to specify multiple paths");

                var query = includedPaths.Select(ConfigurationPath.New).ToList();
                var data = await _tweek.Calculate(query, identities, contextProps);
                return Json(!isFlatten ? (TreeResult.From(data, translateValue)) : data.ToDictionary(x => x.Key.ToString(), x => translateValue(x.Value)));
            }
            else
            {
                var query = ConfigurationPath.New(path);
                var data = await _tweek.Calculate(query, identities, contextProps);

                if (query.IsScan)
                {
                    var relativeData = data.ToDictionary(x => x.Key.ToRelative(query), x => x.Value);
                    return Json(!isFlatten ? (TreeResult.From(relativeData, translateValue)) : relativeData.ToDictionary(x => x.Key.ToString(), x => translateValue(x.Value)));
                }

                return data.Select(x => ignoreKeyTypes ? (object) x.Value.Value.AsString() : x.Value.Value)
                    .FirstOrNone()
                    .Match(x => Json(x), () => Json(null));
            }
        }
    }
}

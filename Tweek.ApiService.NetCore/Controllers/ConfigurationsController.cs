using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using LanguageExt;
using Tweek.ApiService.Utils;
using Engine.DataTypes;
using FSharp.Data;
using static FSharp.Data.JsonValue;
using Engine.Core.Context;
using Engine;
using Engine.Core.Utils;
using Microsoft.AspNetCore.Authorization;

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
        
        private static object TranslateValueToString(ConfigurationValue v) => v.Value.IsString ? v.Value.AsString() : v.Value.ToString();

        [HttpGet("{*path}")]
        public async Task<ActionResult> GetAsync([FromRoute] string path)
        {
            var allParams = PartitionByKey(HttpContext.Request.Query.ToDictionary(x => x.Key, x => x.Value),
                   x => x.StartsWith("$"));
            var modifiers = allParams.Item1;
            var isFlatten = modifiers.TryGetValue("$flatten").Select(x => bool.Parse(x.ToString())).IfNone(false);
            var ignoreKeyTypes = modifiers.TryGetValue("$ignoreKeyTypes").Select(x => bool.Parse(x.ToString())).IfNone(true);
            TranslateValue translateValue = ignoreKeyTypes ? (TranslateValue)TranslateValueToString : (x => x.Value);

            IReadOnlyDictionary<string, JsonValue> contextParams = allParams.Item2.ToDictionary(x => x.Key,
                x => NewString(x.Value.ToString()), StringComparer.OrdinalIgnoreCase);

            var identities =
                new HashSet<Identity>(contextParams.Where(x => !x.Key.Contains(".")).Select(x => new Identity(x.Key, x.Value.AsString())));

            GetLoadedContextByIdentityType contextProps =
                identityType => key => contextParams.TryGetValue($"{identityType}.{key}");

            var query = ConfigurationPath.New(path);
            var data = await _tweek.Calculate(query, identities, contextProps);

            if (query.IsScan)
                return Json((!isFlatten
                    ? (TreeResult.From(data, translateValue))
                    : data.ToDictionary(x => x.Key.ToString(), x => translateValue(x.Value))));

            return data.Select(x => ignoreKeyTypes ? (object)x.Value.Value.AsString() : x.Value.Value)
                .FirstOrNone()
                .Match(x => Json(x), () => Json(null));


        }
    }
}

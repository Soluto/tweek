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
using Microsoft.AspNetCore.Authorization;
using Newtonsoft.Json;
using Tweek.Utils;
using Tweek.ApiService.NetCore.Security;

namespace Tweek.ApiService.NetCore.Controllers
{
    public class KeysController : Controller
    {
        private ITweek _tweek;
        private readonly CheckAccess _checkAccess;

        public KeysController(ITweek tweek, CheckAccess checkAccess)
        {
            _tweek = tweek;
            _checkAccess = checkAccess;
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

        [HttpGet("keys/{*path}")]
        [HttpGet("configurations/{*path}", Name = "LegacySecurity")]
        public async Task<ActionResult> GetAsync([FromRoute] string path, [FromQuery]Dictionary<string, string> context)
        {
            var allParams = PartitionByKey(context.ToDictionary(x => x.Key, x => x.Value),
                   x => x.StartsWith("$"));

            IReadOnlyDictionary<string, JsonValue> contextParams = allParams.Item2.ToDictionary(x => x.Key,
                x => NewString(x.Value.ToString()), StringComparer.OrdinalIgnoreCase);

            var identities =
                new HashSet<Identity>(contextParams.Where(x => !x.Key.Contains(".")).Select(x => new Identity(x.Key, x.Value.AsString())));

            if (!_checkAccess(User, path, identities, "read_configuration")) return Forbid("Not authorized");

            var modifiers = allParams.Item1;
            var isFlatten = modifiers.TryGetValue("$flatten").Select(x => bool.Parse(x.ToString())).IfNone(false);
            var ignoreKeyTypes = modifiers.TryGetValue("$ignoreKeyTypes").Select(x => bool.Parse(x.ToString())).IfNone(true);
            TranslateValue translateValue = ignoreKeyTypes ? (TranslateValue)TranslateValueToString : (x => x.Value);

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

        /*
        [HttpGet("configurations/{*path}")]
        public async Task<ActionResult> GetLegacyAsync([FromRoute] string path, [FromQuery]IDictionary<string,string> context)
        {
            var allParams = PartitionByKey(context,
                   x => x.StartsWith("$"));

            IReadOnlyDictionary<string, JsonValue> contextParams = allParams.Item2.ToDictionary(x => x.Key,
                x => NewString(x.Value.ToString()), StringComparer.OrdinalIgnoreCase);

            var identities =
                new HashSet<Identity>(contextParams.Where(x => !x.Key.Contains(".")).Select(x => new Identity(x.Key, x.Value.AsString())));

            if (_checkAccess(User, path, identities, "read-configuation")) return Forbid("Not authorized");

            var modifiers = allParams.Item1;
            var isFlatten = modifiers.TryGetValue("$flatten").Select(x => bool.Parse(x.ToString())).IfNone(false);
            var ignoreKeyTypes = modifiers.TryGetValue("$ignoreKeyTypes").Select(x => bool.Parse(x.ToString())).IfNone(true);
            TranslateValue translateValue = ignoreKeyTypes ? (TranslateValue)TranslateValueToString : (x => x.Value);

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
        }*/
    }
}

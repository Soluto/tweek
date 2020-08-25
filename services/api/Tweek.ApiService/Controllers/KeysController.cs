using FSharpUtils.Newtonsoft;
using LanguageExt;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Tweek.ApiService.Security;
using Tweek.ApiService.Utils;
using Tweek.Engine;
using Tweek.Engine.Core.Context;
using Tweek.Engine.Core.Utils;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using Tweek.Utils;
using IdentityHashSet = System.Collections.Generic.HashSet<Tweek.Engine.DataTypes.Identity>;

namespace Tweek.ApiService.Controllers
{
    public class KeysController : Controller
    {
        private readonly ITweek _tweek;
        private readonly IContextDriver _contextDriver;
        private readonly CheckReadConfigurationAccess _checkAccess;

        public KeysController(ITweek tweek, IContextDriver contextDriver, CheckReadConfigurationAccess checkAccess)
        {
            _tweek = tweek;
            _checkAccess = checkAccess;
            _contextDriver = contextDriver;
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

        private static ConfigurationPath[] GetQuery(ConfigurationPath path, string[] includePaths)
        {
            if (includePaths.Length == 0 || !path.IsScan) return new []{path};
            return includePaths.Select(x=> ConfigurationPath.From(path.Folder, x)).ToArray();
        }

        [HttpGet("api/v1/keys/{*path}")]
        [ProducesResponseType(typeof(object), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.Forbidden)]
        [Produces("application/json")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task<ActionResult> GetAsync([FromRoute] string path)
        {
            var allParams = PartitionByKey(HttpContext.Request.Query.ToDictionary(x => x.Key, x => x.Value), x => x.StartsWith("$"));
            var modifiers = allParams.Item1;
            var isFlatten = modifiers.TryGetValue("$flatten").Select(x => bool.Parse(x.First())).IfNone(false);
            var includeErrors = modifiers.TryGetValue("$includeErrors").Select(x => bool.Parse(x.First())).IfNone(false);
            var ignoreKeyTypes = modifiers.TryGetValue("$ignoreKeyTypes").Select(x => bool.Parse(x.First())).IfNone(false);
            var includePaths = modifiers.TryGetValue("$include").Select(x => x.ToArray()).IfNone(new string[] {});

            var translateValue = ignoreKeyTypes ? (TranslateValue)TranslateValueToString : (x => x.Value);

            IReadOnlyDictionary<string, JsonValue> contextParams = allParams.Item2.ToDictionary(x => x.Key,
                x => x.Value.Count == 1 ? JsonValue.NewString(x.Value.ToString()) : JsonValue.NewArray(x.Value.Map(t=> JsonValue.NewString(t)).ToArray()), StringComparer.OrdinalIgnoreCase);

            var identities = new IdentityHashSet(contextParams.Where(x => !x.Key.Contains(".")).Select(x => new Identity(x.Key, x.Value.AsString())));
            if (!_checkAccess(User, path, identities)) return Forbid();
            GetLoadedContextByIdentityType contextProps =
                identityType => key => contextParams.TryGetValue($"{identityType}.{key}");

            var root = ConfigurationPath.New(path);

            var query = GetQuery(root, includePaths);

            var values = await _tweek.GetContextAndCalculate(query, identities, _contextDriver, contextProps);

            var errors = values.Where(x => x.Value.Exception != null).ToDictionary(x => x.Key, x => x.Value.Exception.Message);

            Response.Headers.Add("X-Error-Count", errors.Count.ToString());

            object result = null;
            if (root.IsScan)
            {
                var relativeData = values.Where(x => x.Value.Exception == null).ToDictionary(x => x.Key.ToRelative(root), x => x.Value);
                result = !isFlatten
                    ? TreeResult.From(relativeData, translateValue)
                    : relativeData.ToDictionary(x => x.Key.ToString(), x => translateValue(x.Value));
            }
            else if (values.TryGetValue(root, out var value) && value.Exception == null)
            {
                result = ignoreKeyTypes ? TranslateValueToString(value) : value.Value;
            }

            if (!includeErrors)
            {
                return Json(result);
            }


            return Json(new Dictionary<string, object> {{"data", result}, {"errors", errors}});
        }
    }
}

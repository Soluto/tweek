using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
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
using Engine.Drivers.Context;
using Newtonsoft.Json;
using Tweek.Utils;
using Tweek.ApiService.NetCore.Security;
using Microsoft.AspNetCore.Cors;
using IdentityHashSet = System.Collections.Generic.HashSet<Engine.DataTypes.Identity>;

namespace Tweek.ApiService.NetCore.Controllers
{
    [EnableCors("Keys")]
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

        /// <summary>
        /// Returns the requested key given by path
        /// </summary>
        /// <remarks>
        /// TODO: add example
        /// </remarks>
        /// <param name="path">Path of the key</param>
        /// <returns>Value for the requested key</returns>
        /// <response code="200">Value for the requested key</response>
        /// <response code="403">Access denied</response>
        [HttpGet("api/v1/keys/{*path}")]
        [ProducesResponseType(typeof(object), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.Forbidden)]
        [Produces("application/json")]
        public async Task<ActionResult> GetAsync([FromRoute] string path)
        {
            var allParams = PartitionByKey(HttpContext.Request.Query.ToDictionary(x => x.Key, x => x.Value), x => x.StartsWith("$"));
            var modifiers = allParams.Item1;
            var isFlatten = modifiers.TryGetValue("$flatten").Select(x => bool.Parse(x.First())).IfNone(false);
            var ignoreKeyTypes = modifiers.TryGetValue("$ignoreKeyTypes").Select(x => bool.Parse(x.First())).IfNone(false);
            var includePaths = modifiers.TryGetValue("$include").Select(x => x.ToArray()).IfNone(new string[] {});

            var translateValue = ignoreKeyTypes ? (TranslateValue)TranslateValueToString : (x => x.Value);

            IReadOnlyDictionary<string, JsonValue> contextParams = allParams.Item2.ToDictionary(x => x.Key,
                x => NewString(x.Value.ToString()), StringComparer.OrdinalIgnoreCase);

            var identities = new IdentityHashSet(contextParams.Where(x => !x.Key.Contains(".")).Select(x => new Identity(x.Key, x.Value.AsString())));
            if (!_checkAccess(User, path, identities)) return Forbid();
            GetLoadedContextByIdentityType contextProps =
                identityType => key => contextParams.TryGetValue($"{identityType}.{key}");

            var root = ConfigurationPath.New(path);

            var query = GetQuery(root, includePaths);

            var data = await _tweek.GetContextAndCalculate(query, identities, _contextDriver, contextProps);

            if (root.IsScan)
            {
                var relativeData = data.ToDictionary(x => x.Key.ToRelative(root), x => x.Value);
                return Json(!isFlatten ? (TreeResult.From(relativeData, translateValue)) : relativeData.ToDictionary(x => x.Key.ToString(), x => translateValue(x.Value)));
            }

            return data.Select(x => ignoreKeyTypes ? (object) x.Value.Value.AsString() : x.Value.Value)
                    .FirstOrNone()
                    .Match(x => Json(x), () => Json(null));
        }
    }
}

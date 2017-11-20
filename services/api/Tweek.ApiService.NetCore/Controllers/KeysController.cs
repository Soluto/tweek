using Engine.Drivers.Context;
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
using Tweek.ApiService.NetCore.Security;
using Tweek.ApiService.Utils;
using Tweek.Engine;
using Tweek.Engine.Core.Context;
using Tweek.Engine.Core.Utils;
using Tweek.Engine.DataTypes;
using Tweek.Utils;
using static FSharpUtils.Newtonsoft.JsonValue;
using IdentityHashSet = System.Collections.Generic.HashSet<Tweek.Engine.DataTypes.Identity>;

namespace Tweek.ApiService.NetCore.Controllers
{
    [EnableCors(CorsExtensions.KEYS_POLICY_NAME)]
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
        /// Query tweek for calculating key/s value/s
        /// </summary>
        /// <remarks>
        /// The main rest endpoint for interacting with Tweek, you can use "_" suffix in keypath for querying configuration subtrees.
        /// You can use api/v1/keys/{keypath} instead of passing keyPath as a paramater. (due to swagger limitation, we support keyPath param as well)
        /// Context should be added to the request with dynamic query params, it can be set of identities and/or properties for example: user=john&amp;user.age=30&amp;user.source=ads
        /// </remarks>
        /// <param name="keyPath">keyPath - the full path to the key. (path/to/key)</param>
        /// <param name="flatten">When using scan operations ("_"), use this flag to receive configuration as flatten list instead of a tree (default: false)</param>
        /// <param name="includeKeys">When using scan operations ("_"), use this options to request only subset of the scan subtrees  (default: [])</param>
        /// <returns>Value for the requested key, or a subtree of keys/values</returns>
        /// <response code="200">Success</response>
        /// <response code="403">Access denied</response>
        [HttpGet("api/v1/keys")]
        [Produces("application/json")]
        [ProducesResponseType(typeof(object), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(void), (int)HttpStatusCode.Forbidden)]
        public async Task<ActionResult> GetAsyncSwagger([FromQuery] string keyPath, 
                    [FromQuery( Name = "$flatten")] bool flatten = false, 
                    [FromQuery( Name = "$include")] List<string> includeKeys = null)
        {
            if (System.String.IsNullOrWhiteSpace(keyPath)) return BadRequest("Missing key path");
            return await GetAsync(keyPath);
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

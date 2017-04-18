using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;
using Tweek.AnalyticsApiService.NetCore.Utils;

namespace Tweek.AnalyticsApiService.NetCore.Controllers
{
    [Route("api/v1/events")]
    [EnableCors("All")]
    public class FunnelController : Controller
    {
        private readonly RedisContext _redisContext;
        private readonly TweekApiClient _tweekApiClient;

        public FunnelController(RedisContext redisConetxt, TweekApiClient tweekApiClient)
        {
            _redisContext = redisConetxt;
            _tweekApiClient = tweekApiClient;
        }

        private string EventHash(string path, Identity identity, string eventName, string variant) =>
            path + identity.Type + identity.Id + eventName + variant;

        private async Task<string> GetVariant(string keyPath, Identity identity)
        {
            var path = "/api/v1/keys/" + keyPath.Trim('/') + $"?{identity.Type}={identity.Id}";
            return await _tweekApiClient.Get<string>(path);
        }

        [HttpPost("{identityType}/{identityId}/{*path}")]
        public async Task<ActionResult> Post(
            [FromRoute] string identityType,
            [FromRoute] string identityId,
            [FromRoute] string path,
			[FromQuery(Name = "event")] string eventName)
        {
            var identity = new Identity(identityType, identityId);
            var variant = await GetVariant(path, identity);
            if (variant == null) return BadRequest("Missing value for key");

            var eventHash = EventHash(path, identity, eventName, variant);
            var didHappen = _redisContext.PersistenceAction(client => client.Get<bool>(eventHash));
            if (didHappen) return Ok();
            _redisContext.PersistenceAction(client =>
            {
                client.Set(eventHash, true);
                client.IncrementValueInHash(path, $"{variant}__{eventName}", 1);
                return true;
            });
            return Ok();
        }

        [HttpGet("{*path}")]
        public async Task<Dictionary<string, Dictionary<string, long>>> Get([FromRoute] string path)
        {
            var variants = _redisContext.PersistenceAction(client => client.GetAllEntriesFromHash(path));
            return variants.Select(keyValuePair =>
            {
                var variantAndEvent = Regex.Split(keyValuePair.Key, "__");
                return new
                {
                    variant = variantAndEvent[0],
                    eventName = variantAndEvent[1],
                    count = long.Parse(keyValuePair.Value)
                };
            })
            .GroupBy(x => x.variant)
            .ToDictionary(grouping => grouping.Key, grouping => grouping.ToDictionary(group => group.eventName, group => group.count));
        }
    }

    public class Identity : Tuple<string, string>
    {
        public string Type { get { return Item1; } }
        public string Id { get { return Item2; } }

        public Identity(string type, string id)
            : base(type, id)
        {
        }
    }
}

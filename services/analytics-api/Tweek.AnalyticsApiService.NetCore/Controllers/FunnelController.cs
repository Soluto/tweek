using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using ServiceStack.Redis;
using Newtonsoft.Json;
using System.Net.Http;
using System.Text.RegularExpressions;

namespace Tweek.AnalyticsApiService.NetCore.Controllers
{
    [Route("api/v1/funnel")]
    [EnableCors("All")]
    public class FunnelController : Controller
    {
		private string _eventHash(string path, Identity identity, string eventName, string variant) => 
			path + identity.Type + identity.Id + eventName + variant;

		private T persistenceAction<T>(Func<IRedisClient, T> action)
		{ 
			var manager = new RedisManagerPool("tweek-analytics-redis.119e4587.svc.dockerapp.io:6379");
			using (var client = manager.GetClient())
            {
				// TODO: change to client with async api
				return action(client);
			}
		}

		private async Task<string> GetVariant(string path, Identity identity){
			var baseUrl = "http://tweek-api/api/v1";
			var url = baseUrl.TrimEnd('/') + "/keys/" + path.Trim('/') + $"?{identity.Type}={identity.Id}";
			using (var httpClient = new HttpClient())
			{
				return JsonConvert.DeserializeObject<string>(await httpClient.GetStringAsync(url));				
			}
		}

        [HttpPost("{*path}")]
        public async Task<ActionResult> Post([FromRoute] string path, [FromQuery(Name = "event")] string eventName)
        {
			var identities = new HashSet<Identity>(
				HttpContext.Request.Query.Where(x => x.Key != "event").ToDictionary(x => x.Key, x => x.Value)
					.Select(x => new Identity(x.Key, x.Value)));

            if (identities.Count == 0) return BadRequest("At least one identity is mandatory for funnels");
			if (identities.Count > 1) return BadRequest("Only one identity is currently supported");			

			var identity = identities.ElementAt(0);
			var variant = await GetVariant(path, identity);
			if (variant == null) return BadRequest("Missing value for key");

			var eventHash = _eventHash(path, identity, eventName, variant);
			var didHappen = persistenceAction(client => client.Get<bool>(eventHash));
			if (didHappen) return Ok();
			persistenceAction(client => 
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
			var variants = persistenceAction(client => client.GetAllEntriesFromHash(path));
			return variants.Select(keyValuePair => 
			{
				var variantAndEvent = Regex.Split(keyValuePair.Key, "__");
				return new {
					variant = variantAndEvent[0],
					eventName = variantAndEvent[1],
					count = long.Parse(keyValuePair.Value)
				};
			})
			.GroupBy(x => x.variant)
			.ToDictionary(grouping => grouping.Key, grouping => grouping.ToDictionary(group => group.eventName, group => group.count));
		}
    }

	public class Identity: Tuple<string, string>
    {
        public string Type {get { return Item1; }}
        public string Id {get { return Item2; }}

        public Identity(string type, string id)
            : base(type, id)
        {
        }
    }
}

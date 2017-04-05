using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using ServiceStack.Redis;

namespace Tweek.AnalyticsApiService.NetCore.Controllers
{
    [Route("api/v1/funnel")]
    [EnableCors("All")]
    public class FunnelController : Controller
    {
		private string _eventHash(string path, Identity identity, string eventName) => 
			path + identity.Item1 + identity.Item2 + eventName;

		private T persistenceAction<T>(Func<IRedisClient, T> action)
		{ 
			var manager = new RedisManagerPool("tweek-analytics-redis.119e4587.svc.dockerapp.io:6379");
			using (var client = manager.GetClient())
            {
				// TODO: change to client with async api
				return action(client);
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
			var eventHash = _eventHash(path, identity, eventName);
			var didHappen = persistenceAction(client => client.Get<bool>(eventHash));
			if (didHappen) return Ok();
			persistenceAction(client => {
				client.Set(eventHash, true);
				client.IncrementValueInHash(path, eventName, 1);
				return true;
			});
			return Ok();
        }

		[HttpGet("{*path}")]
		public async Task<Dictionary<string, long>> Get([FromRoute] string path)
		{
			var keyEvents = persistenceAction(client => client.GetAllEntriesFromHash(path));
			return keyEvents.ToDictionary(x => x.Key, x => long.Parse(x.Value));
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

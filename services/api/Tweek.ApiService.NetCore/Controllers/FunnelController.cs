using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;
using System.Linq;
using System.Collections.Generic;
using Engine.DataTypes;
using Microsoft.AspNetCore.Http;

namespace Tweek.ApiService.NetCore.Controllers
{
  [Route("api/v1/funnel")]
    [EnableCors("All")]
    public class FunnelController : Controller
    {
		private static HashSet<string> Events = new HashSet<string>();
		private static Dictionary<string, Dictionary<string, long>> EventCounters = 
			new Dictionary<string, Dictionary<string, long>>();

        private string _eventHash(string path, Identity identity, string eventName) => 
			path + identity.Item1 + identity.Item2 + eventName;

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
			if (Events.Contains(eventHash)) return Ok();
			Events.Add(eventHash);
			if (!EventCounters.ContainsKey(path)) EventCounters.Add(path, new Dictionary<string, long>{{eventName, 0}});
			EventCounters[path][eventName] = EventCounters[path][eventName] + 1;
			return Ok();
        }

		[HttpGet("{*path}")]
		public async Task<Dictionary<string, long>> Get([FromRoute] string path)
		{
			if (!EventCounters.ContainsKey(path)) return new Dictionary<string, long>();
			return EventCounters[path];
		}
    }
}

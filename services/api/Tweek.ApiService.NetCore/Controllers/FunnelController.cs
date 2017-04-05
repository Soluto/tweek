using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;

using System;
using System.Linq;
using Tweek.ApiService.NetCore.Security;
using System.Collections.Generic;
using Engine.DataTypes;
using Microsoft.AspNetCore.Http;

namespace Tweek.ApiService.NetCore.Controllers
{
	public class FunnelCounters
	{
		public int Start = 0;
		public int Complete = 0;
		public void IncrementStart() => Start++;
		public void IncrementComplete() => Complete++;
	}
	
	[Route("api/v1/funnel")]
    [EnableCors("All")]
    public class FunnelController : Controller
    {
		private static HashSet<string> Events = new HashSet<string>();
		private static Dictionary<string, FunnelCounters> EventCounters = new Dictionary<string, FunnelCounters>();

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
			if (eventName != "start" && eventName != "complete") return BadRequest("Only 'start' and 'complete' events are currently supported");
			
			var identity = identities.ElementAt(0);
			var eventHash = _eventHash(path, identity, eventName);
			if (Events.Contains(eventHash)) return Ok();
			Events.Add(eventHash);
			if (!EventCounters.ContainsKey(path)) EventCounters.Add(path, new FunnelCounters());
			switch (eventName){
				case "start": EventCounters[path].IncrementStart(); break;
				case "complete": EventCounters[path].IncrementComplete(); break;
			};
			return Ok();
        }
    }
}

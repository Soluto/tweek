using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Engine.Core.Rules;
using Engine.Drivers.Rules;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Engine.Core.Rules;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Tweek.ApiService.NetCore.Controllers
{
    [Route("validation")]
    public class ValidationController : Controller
    {
        private IRuleParser _parser;
        // GET: api/values
        public ValidationController(IRuleParser parser)
        {
            _parser = parser;
        }

        public bool IsParsable(string payload)
        {
            try
            {
                _parser.Parse(payload);
                return true;
            }
            catch
            {
                return false;
            }
        }

        [HttpPost]
        public async Task<ActionResult> Validate()
        {
            Dictionary<string, RuleDefinition> ruleset = null;
            try
            {
                var raw = await (new StreamReader(HttpContext.Request.Body).ReadToEndAsync());
                ruleset = JsonConvert.DeserializeObject<Dictionary<string, RuleDefinition>>(raw);
            }
            catch (Exception)
            {
                return BadRequest("invalid ruleset");
            }

            var failures = ruleset
                .Where(x => !IsParsable(x.Value.Payload))
                .Select(x => x.Key);

            if (failures.Any()) return BadRequest(failures);
            return Content("true");
        }
    }
}


using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Engine.Rules.Validation;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Tweek.ApiService.NetCore.Security;



namespace Tweek.ApiService.NetCore.Controllers
{
    [Route("validation")]
    public class ValidationController : Controller
    {
        private readonly Validator.ValidationDelegate mValidateRules;

        public ValidationController(Validator.ValidationDelegate validateRules)
        {
            mValidateRules = validateRules;
        }

        [HttpPost]
        [ApiExplorerSettings(IgnoreApi = true)]
        public async Task<ActionResult> Validate([FromBody] Dictionary<string, RuleDefinition> ruleset)
        {
            if (!User.IsTweekIdentity()) return Forbid();

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

            return await mValidateRules(ruleset) ? (ActionResult)Content("true") : BadRequest("invalid ruleset");
        }
    }
}


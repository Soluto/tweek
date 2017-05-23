using System.Collections.Generic;
using System.Net;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Engine.Rules.Validation;
using Microsoft.AspNetCore.Mvc;


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
            return await mValidateRules(ruleset) ? (ActionResult)Content("true") : BadRequest("invalid ruleset");
        }
    }
}


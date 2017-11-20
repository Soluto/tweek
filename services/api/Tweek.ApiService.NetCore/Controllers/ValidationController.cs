using Engine.Drivers.Rules;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using Tweek.ApiService.NetCore.Security;
using Tweek.Engine.Rules.Validation;

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

            return await mValidateRules(ruleset) ? (ActionResult)Content("true") : BadRequest("invalid ruleset");
        }
    }
}

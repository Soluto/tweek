using Engine.Drivers.Rules;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Tweek.ApiService.NetCore.Security;

namespace Tweek.ApiService.NetCore.Controllers
{
    [EnableCors(CorsExtensions.ALLOW_ALL_POLICY_NAME)]
    public class RepoVersionController : Controller
    {
        private readonly IRulesDriver _rulesDriver;

        public RepoVersionController(IRulesDriver rulesDriver)
        {
            _rulesDriver = rulesDriver;
        }

        [HttpGet("api/v1/repo-version")]
        public string Get() => _rulesDriver.CurrentLabel;
    }
}

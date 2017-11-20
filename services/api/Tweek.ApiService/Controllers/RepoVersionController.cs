using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Tweek.ApiService.NetCore.Security;
using Tweek.Engine.Drivers.Rules;

namespace Tweek.ApiService.NetCore.Controllers
{
    [EnableCors(CorsExtensions.ALLOW_ALL_POLICY_NAME)]
    public class RepoVersionController : Controller
    {
        private readonly IRulesRepository mRulesRepository;

        public RepoVersionController(IRulesRepository rulesRepository)
        {
            mRulesRepository = rulesRepository;
        }

        [HttpGet("api/v1/repo-version")]
        public string Get() => mRulesRepository.CurrentLabel;
    }
}

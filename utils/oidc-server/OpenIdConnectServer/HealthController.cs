using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace OpenIdConnectServer
{
    public class HealthController : Controller
    {
        [HttpGet("/health")]
        public IActionResult Get()
        {
            return Ok();
        }
    }
}
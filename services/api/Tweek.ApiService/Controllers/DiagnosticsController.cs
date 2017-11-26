using Microsoft.AspNetCore.Mvc;
using System.Reflection;

namespace Tweek.ApiService.Controllers
{
    public class DiagnosticsController : Controller
    {
        private string _version = Assembly.GetEntryAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion;

        [HttpGet("version")]
        public string Version()=> _version;

        [HttpGet("gc")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public bool GC() => System.Runtime.GCSettings.IsServerGC;

        [HttpGet("")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public void Default(){
            
        }
    }
}

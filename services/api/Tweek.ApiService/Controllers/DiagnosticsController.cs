using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection;
using Tweek.ApiService.Addons;

namespace Tweek.ApiService.NetCore.Controllers
{
    public class DiagnosticsController : Controller
    {
        private string _version = Assembly.GetEntryAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion;
        private IEnumerable<IDiagnosticsProvider> _diagnosticsProviders;

        public DiagnosticsController(IEnumerable<IDiagnosticsProvider> diagnosticsProviders)
        {
            _diagnosticsProviders = diagnosticsProviders;
        }

        [HttpGet("version")]
        public string Version()=> _version;

        [HttpGet("isalive")]
        [ProducesResponseType(typeof(Int32), (int) HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Int32), (int) HttpStatusCode.ServiceUnavailable)]
        public IActionResult IsAlive() => _diagnosticsProviders.All(x => x.IsAlive())
            ? (IActionResult) Ok(HttpStatusCode.OK)
            : StatusCode((int) HttpStatusCode.ServiceUnavailable);

        [HttpGet("status")]
        [ProducesResponseType(typeof(object), (int)HttpStatusCode.OK)]
        [ApiExplorerSettings(IgnoreApi = true)]
        public dynamic Status()
            => _diagnosticsProviders.ToDictionary(provider => provider.Name, provider => provider.GetDetails());

        [HttpGet("gc")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public bool GC() => System.Runtime.GCSettings.IsServerGC;

        [HttpGet("")]
        [ApiExplorerSettings(IgnoreApi = true)]
        public void Default(){
            
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Engine.DataTypes;
using Microsoft.AspNetCore.Mvc;
using Tweek.ApiService.NetCore.Diagnostics;

namespace Tweek.ApiService.NetCore.Controllers
{
    public class DiagnosticsController : Controller
    {
        private IEnumerable<IDiagnosticsProvider> _diagnosticsProviders;

        public DiagnosticsController(IEnumerable<IDiagnosticsProvider> diagnosticsProviders)
        {
            _diagnosticsProviders = diagnosticsProviders;
        }

        [HttpGet("isalive")]
        public HttpStatusCode IsAlive() => _diagnosticsProviders.All(x => x.IsAlive()) ? HttpStatusCode.OK : HttpStatusCode.ServiceUnavailable;

        [HttpGet("status")]
        public dynamic Status()
            => _diagnosticsProviders.ToDictionary(provider => provider.Name, provider => provider.GetDetails());

        [HttpGet("gc")]
        public dynamic GC() => System.Runtime.GCSettings.IsServerGC;

        [HttpGet("")]
        public void Default(){
            
        }
    }
}

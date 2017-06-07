using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Engine.DataTypes;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.SwaggerGen;
using Tweek.ApiService.Addons;
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
        [ProducesResponseType(typeof(Int32), (int)HttpStatusCode.OK)]
        [ProducesResponseType(typeof(Int32), (int)HttpStatusCode.ServiceUnavailable)]
        public HttpStatusCode IsAlive() => _diagnosticsProviders.All(x => x.IsAlive()) ? HttpStatusCode.OK : HttpStatusCode.ServiceUnavailable;

        [HttpGet("status")]
        [ProducesResponseType(typeof(object), (int)HttpStatusCode.OK)]
        public dynamic Status()
            => _diagnosticsProviders.ToDictionary(provider => provider.Name, provider => provider.GetDetails());

        [HttpGet("gc")]
        public bool GC() => System.Runtime.GCSettings.IsServerGC;

        [HttpGet("")]
        public void Default(){
            
        }
    }
}

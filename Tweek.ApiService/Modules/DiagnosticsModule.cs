using System.Collections.Generic;
using System.Linq;
using Nancy;
using Nancy.Responses;
using Tweek.ApiService.Interfaces;
using Tweek.ApiService.Services;

namespace Tweek.ApiService.Modules
{
    public class DiagnosticsModule : NancyModule
    {
        public DiagnosticsModule(IEnumerable<IDiagnosticsProvider> diagnosticProviders)
        {
            Get["/isalive"] = _ => diagnosticProviders.All(x => x.IsAlive()) ? HttpStatusCode.OK : HttpStatusCode.ServiceUnavailable;

            Get["/status"] = _ => new JsonResponse(diagnosticProviders.ToDictionary(provider => provider.Name, provider => provider.GetDetails()), new DefaultJsonSerializer());
        }
    }
}
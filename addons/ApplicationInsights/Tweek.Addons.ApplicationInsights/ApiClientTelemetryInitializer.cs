using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.AspNetCore.Http;

namespace Tweek.Addons.ApplicationInsights
{
  public class ApiClientTelemetryInitializer : ITelemetryInitializer
    {
        IHttpContextAccessor httpContextAccessor;

        public ApiClientTelemetryInitializer(IHttpContextAccessor httpContextAccessor)
        {
            this.httpContextAccessor = httpContextAccessor;
        }
        public void Initialize(ITelemetry telemetry)
        {
            if (httpContextAccessor.HttpContext?.Request?.Headers.TryGetValue("x-api-client", out var apiClient) ?? false){
                telemetry.Context.Properties["ApiClientId"] = apiClient.ToString();
            }
        }
    }
}

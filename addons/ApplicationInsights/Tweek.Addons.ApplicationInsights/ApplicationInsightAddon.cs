using System;
using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.Addons;

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
            if (httpContextAccessor.HttpContext == null) return;
            if (httpContextAccessor.HttpContext.Request.Headers.TryGetValue("x-api-client", out var values)){
                telemetry.Context.Properties["x-api-client"] = values.ToString();
            }
        }
    }

    public class ApplicationInsightsAddon : ITweekAddon
    {
        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
            var initializer = new ApiClientTelemetryInitializer(builder.ApplicationServices.GetService<IHttpContextAccessor>());
            var telemetryConfiguration= builder.ApplicationServices.GetService<TelemetryConfiguration>();
            telemetryConfiguration.TelemetryInitializers.Add(initializer);
        }

        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
            services.AddApplicationInsightsTelemetry(configuration);
        }
    }
}

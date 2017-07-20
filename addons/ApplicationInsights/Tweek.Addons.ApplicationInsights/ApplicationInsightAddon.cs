using System;
using Microsoft.ApplicationInsights.Extensibility;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.Addons;

namespace Tweek.Addons.ApplicationInsights
{

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

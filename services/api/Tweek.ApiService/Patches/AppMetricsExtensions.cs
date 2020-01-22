

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Routing;
using System.Linq;

namespace Tweek.ApiService.Patches

{
    public static class AppMetricsExtensions{
        public static void UseAppMetricsEndpointRoutesResolver(this IApplicationBuilder app)
            {
                var metricsCurrentRouteName = "__App.Metrics.CurrentRouteName__";
                app.Use(((context, next) =>
                {
                    var endpointFeature = context.Features[typeof(IEndpointFeature)] as IEndpointFeature;
                    if (endpointFeature?.Endpoint is RouteEndpoint endpoint)
                    {
                        var routePattern = endpoint.RoutePattern?.RawText;
                        if (!context.Items.ContainsKey(metricsCurrentRouteName))
                        {
                            context.Items.Add(metricsCurrentRouteName, $"{routePattern}");
                        }
                    }

                    return next();
                }));
            }
    }
}
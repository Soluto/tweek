using System;
using App.Metrics.Extensions.Reporting.Graphite;
using App.Metrics.Extensions.Reporting.Graphite.Client;
using App.Metrics.Reporting.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.Addons;

namespace Tweek.Addons.AppMetrics.GraphiteReporter
{
    public class GraphiteReporterAddon : ITweekAddon
    {
        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
        }

        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
            services
                .AddMetrics()
                .AddReporting(factory =>
                {
                    var appMetricsReporters = configuration.GetSection("AppMetricsReporters");
                    foreach (var reporter in appMetricsReporters.GetChildren())
                    {
                        if (reporter.Key.Equals("graphite", StringComparison.OrdinalIgnoreCase))
                        {
                            factory.AddGraphite(new GraphiteReporterSettings
                            {
                                HttpPolicy = new HttpPolicy
                                {
                                    FailuresBeforeBackoff = 3,
                                    BackoffPeriod = TimeSpan.FromSeconds(30),
                                    Timeout = TimeSpan.FromSeconds(3)
                                },
                                GraphiteSettings =
                                    new GraphiteSettings(
                                        new Uri(
                                            $"net.tcp://{reporter.GetValue<string>("Url")}:{reporter.GetValue("Port", 2003)}"))
                                    {
                                        MetricNameFormatter =
                                            GraphiteNameFormatter.FromTemplate(
                                                reporter.GetValue("Prefix", "TweekApi") +
                                                ".{tag:mtype}.{tag:host}.{context}.{tag:route}.{name}.{field}.{tag:http_status_code}")
                                    },
                                ReportInterval = TimeSpan.FromSeconds(5)
                            });
                        }
                    }
                });
        }
    }
}

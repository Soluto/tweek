using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using App.Metrics;
using App.Metrics.Health;
using App.Metrics.Health.Abstractions;
using Tweek.ApiService.Addons;

namespace Tweek.ApiService.NetCore.Diagnostics
{
    public class HealthChecksRegistrar
    {
        private readonly IEnumerable<IDiagnosticsProvider> mDiagnosticsProviders;
        private readonly string mRulesBlobUrl;

        public HealthChecksRegistrar(IEnumerable<IDiagnosticsProvider> diagnosticsProviders, string rulesBlobUrl)
        {
            mDiagnosticsProviders = diagnosticsProviders;
            mRulesBlobUrl = rulesBlobUrl;
        }
        public void RegisterHelthChecks(IHealthCheckFactory factory)
        {
            foreach (var diagnosticsProvider in mDiagnosticsProviders)
            {
                var healthy = diagnosticsProvider.GetDetails().ToString()
                    .Replace("{", "")
                    .Replace("}", "")
                    .Trim();

                factory.Register(diagnosticsProvider.Name,
                    () => Task.FromResult(diagnosticsProvider.IsAlive()
                        ? HealthCheckResult.Healthy(healthy)
                        : HealthCheckResult.Unhealthy($"Health check failed for {diagnosticsProvider.Name}")));
            }

            var rulesBlobUri = new Uri(mRulesBlobUrl).GetComponents(UriComponents.Scheme | UriComponents.StrongAuthority, UriFormat.Unescaped);

            factory.RegisterHttpGetHealthCheck("ManagementIsAlive", new Uri($"{rulesBlobUri}/isAlive"), TimeSpan.FromSeconds(5));
        }
    }
}

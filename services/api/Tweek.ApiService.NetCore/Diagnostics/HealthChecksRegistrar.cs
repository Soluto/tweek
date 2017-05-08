using System;
using System.Threading.Tasks;
using App.Metrics;
using App.Metrics.Health;
using App.Metrics.Health.Abstractions;

namespace Tweek.ApiService.NetCore.Diagnostics
{
    public class HealthChecksRegistrar
    {
        private readonly string mRulesBlobUrl;

        public HealthChecksRegistrar(string rulesBlobUrl)
        {
            mRulesBlobUrl = rulesBlobUrl;
        }
        public void RegisterHelthChecks(IHealthCheckFactory factory)
        {
            var rulesBlobUri = new Uri(mRulesBlobUrl).GetComponents(UriComponents.Scheme | UriComponents.StrongAuthority, UriFormat.Unescaped);

            factory.RegisterHttpGetHealthCheck("ManagementIsAlive", new Uri($"{rulesBlobUri}/isAlive"), TimeSpan.FromSeconds(5));
        }
    }
}

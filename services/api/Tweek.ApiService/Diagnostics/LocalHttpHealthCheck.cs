using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using App.Metrics.Health;
using App.Metrics.Health.Builder;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;

namespace Tweek.ApiService.Diagnostics
{
    public class LocalHttpHealthCheck : HealthCheck
    {
        private readonly IServer server;
        private HealthCheck healthCheck;

        public LocalHttpHealthCheck(IServer server) : base("LocalHttp")
        {
            this.server = server;
        }

        protected async override ValueTask<HealthCheckResult> CheckAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            if (healthCheck == null){
                var addresses = server.Features.Get<IServerAddressesFeature>().Addresses;
                if (!addresses.Any()){
                    return HealthCheckResult.Unhealthy();
                }
                healthCheck = AppMetricsHealth.CreateDefaultBuilder()
                    .HealthChecks.AddHttpGetCheck("local", new Uri(addresses
                    .First()
                    .Replace("[::]", "localhost")
                    ), TimeSpan.FromSeconds(5))
                    .Build()
                    .Checks.First();
            }

            return (await healthCheck.ExecuteAsync(cancellationToken)).Check;
        }
    }
}
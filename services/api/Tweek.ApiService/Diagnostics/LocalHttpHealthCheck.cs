using System;
using System.Linq;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using HealthChecks.Uris;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Tweek.ApiService.Diagnostics
{
    public class LocalHttpHealthCheck : IHealthCheck
    {
        private readonly IServer server;
        private IHealthCheck healthCheck;

        private IHttpClientFactory httpClientFactory;

        public LocalHttpHealthCheck(IServer server, IHttpClientFactory httpClientFactory)// : base("LocalHttp")
        {
            this.server = server;
            this.httpClientFactory = httpClientFactory;
        }


        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            if (healthCheck == null){
                var addresses = server.Features.Get<IServerAddressesFeature>().Addresses;
                if (!addresses.Any()){
                    return HealthCheckResult.Unhealthy();
                }
                
                healthCheck = new UriHealthCheck(
                    new UriHealthCheckOptions().UseGet().AddUri(new Uri(addresses.First().Replace("[::]", "localhost" ) )), ()=>httpClientFactory.CreateClient() );
                
            }

            return (await healthCheck.CheckHealthAsync(context, cancellationToken));
        }
    }
}
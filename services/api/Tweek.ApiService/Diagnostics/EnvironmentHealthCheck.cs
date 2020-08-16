using System;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Tweek.ApiService.Diagnostics
{
    public class EnvironmentHealthCheck : IHealthCheck
    {
        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = new CancellationToken()) =>  
            HealthCheckResult.Healthy($"Host = {Environment.MachineName}, Version = {AppVersion}");


        public static readonly string AppVersion =
            Assembly.GetEntryAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>()
                .InformationalVersion;
    }
}
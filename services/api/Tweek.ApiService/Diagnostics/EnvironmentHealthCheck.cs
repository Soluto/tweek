using System;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using App.Metrics.Health;

namespace Tweek.ApiService.Diagnostics
{
    public class EnvironmentHealthCheck : HealthCheck
    {
        public EnvironmentHealthCheck() : base("EnvironmentDetails") { }

        protected async override ValueTask<HealthCheckResult> CheckAsync(CancellationToken cancellationToken = new CancellationToken()) =>  
            HealthCheckResult.Healthy($"Host = {Environment.MachineName}, Version = {AppVersion}");

        public static readonly string AppVersion =
            Assembly.GetEntryAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>()
                .InformationalVersion;
    }
}
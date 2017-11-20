using System.Threading;
using System.Threading.Tasks;
using App.Metrics.Health;
using Tweek.ApiService.Addons;

namespace Tweek.ApiService.NetCore.Diagnostics
{
    public class DiagnosticsProviderDecorator: HealthCheck
    {
        private readonly IDiagnosticsProvider mDiagnosticsProvider;
        private readonly Task<HealthCheckResult> mUnhealthyResult;

        public DiagnosticsProviderDecorator(IDiagnosticsProvider diagnosticsProvider) : base(diagnosticsProvider.Name)
        {
            mDiagnosticsProvider = diagnosticsProvider;
            mUnhealthyResult = Task.FromResult(HealthCheckResult.Unhealthy($"Health check failed for {mDiagnosticsProvider.Name}"));
        }


        protected override Task<HealthCheckResult> CheckAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            return mDiagnosticsProvider.IsAlive()
                ? HealthyResult()
                : mUnhealthyResult;
        }

        private static string FromatDetails(object details)
        {
            return details.ToString().Replace("{", "").Replace("}", "").Trim();
        }

        private Task<HealthCheckResult> HealthyResult() => Task.FromResult(
            HealthCheckResult.Healthy(
                FromatDetails(mDiagnosticsProvider.GetDetails())
            )
        );
    }
}
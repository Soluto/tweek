using System;
using System.Threading;
using System.Threading.Tasks;
using App.Metrics.Health;
using Tweek.Engine.Drivers.Rules;

namespace Tweek.ApiService.Diagnostics
{
    public class RulesRepositoryHealthCheck : HealthCheck
    {
        private readonly IRulesRepository _repository;

        public RulesRepositoryHealthCheck(IRulesRepository repository)
            :base("RulesRepository")
        {
            _repository = repository;
        }

        protected override async Task<HealthCheckResult> CheckAsync(CancellationToken cancellationToken = new CancellationToken())
        {
            if (DateTime.UtcNow - _repository.LastCheckTime > TimeSpan.FromMinutes(10))
            {
                return HealthCheckResult.Unhealthy("Rules version was not checked in over 10 minutes");
            }
            if (DateTime.UtcNow - _repository.LastCheckTime > TimeSpan.FromMinutes(5))
            {
                return HealthCheckResult.Degraded("Rules version was not checked in over 5 minutes");
            }
            if (string.IsNullOrEmpty(_repository.CurrentLabel))
            {
                return HealthCheckResult.Unhealthy("No rules found");
            }
            return HealthCheckResult.Healthy($"CurrentLabel = {_repository.CurrentLabel}, LastCheckTime = {_repository.LastCheckTime}");
        }
    }
}

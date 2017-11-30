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
        private readonly TimeSpan _unhelthyTimeout;
        private readonly TimeSpan _degradedTimeout;

        public RulesRepositoryHealthCheck(IRulesRepository repository, TimeSpan degradedTimeout, TimeSpan unhelthyTimeout)
            : base("RulesRepository")
        {
            _repository = repository;
            _degradedTimeout = degradedTimeout;
            _unhelthyTimeout = unhelthyTimeout;
        }

        protected override async Task<HealthCheckResult> CheckAsync(
            CancellationToken cancellationToken = new CancellationToken())
        {
            if (string.IsNullOrEmpty(_repository.CurrentLabel))
            {
                return HealthCheckResult.Unhealthy("No rules found");
            }
            if (DateTime.UtcNow - _repository.LastCheckTime > _unhelthyTimeout)
            {
                return HealthCheckResult.Unhealthy("Rules version was not checked in over 10 minutes");
            }
            if (DateTime.UtcNow - _repository.LastCheckTime > _degradedTimeout)
            {
                return HealthCheckResult.Degraded("Rules version was not checked in over 5 minutes");
            }
            return HealthCheckResult.Healthy(
                $"CurrentLabel = {_repository.CurrentLabel}, LastCheckTime = {_repository.LastCheckTime}");
        }
    }
}
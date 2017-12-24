using System;
using System.Threading;
using System.Threading.Tasks;
using App.Metrics.Health;
using Microsoft.Extensions.Configuration;
using Tweek.Engine.Drivers.Rules;

namespace Tweek.ApiService.Diagnostics
{
    public class RulesRepositoryHealthCheck : HealthCheck
    {
        private readonly IRulesRepository _repository;
        private readonly TimeSpan _unhelthyTimeout;
        private readonly TimeSpan _degradedTimeout;

        public RulesRepositoryHealthCheck(IRulesRepository repository, IConfiguration config)
            : base("RulesRepository")
        {
            _repository = repository;
            var failureDelayInMs = config.GetValue("Rules:FailureDelayInMs", 60000);
            _degradedTimeout = TimeSpan.FromMilliseconds(failureDelayInMs * 5);
            _unhelthyTimeout = TimeSpan.FromMilliseconds(failureDelayInMs * 60);
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
                return HealthCheckResult.Unhealthy($"Rules version was last checked at ${_repository.LastCheckTime}. CurrentLabel = {_repository.CurrentLabel}");
            }
            if (DateTime.UtcNow - _repository.LastCheckTime > _degradedTimeout)
            {
                return HealthCheckResult.Degraded($"Rules version was last checked at ${_repository.LastCheckTime}. CurrentLabel = {_repository.CurrentLabel}");
            }
            return HealthCheckResult.Healthy(
                $"CurrentLabel = {_repository.CurrentLabel}, LastCheckTime = {_repository.LastCheckTime}");
        }
    }
}
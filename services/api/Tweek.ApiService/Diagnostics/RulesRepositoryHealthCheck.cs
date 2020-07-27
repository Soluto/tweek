using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Tweek.Engine;
using Tweek.Engine.Drivers.Rules;

namespace Tweek.ApiService.Diagnostics
{
    public class RulesRepositoryHealthCheck : IHealthCheck
    {
        
        private readonly IRulesRepository _repository;
        private readonly TimeSpan _unhealthyTimeout;
        private readonly TimeSpan _degradedTimeout;
        private readonly IServiceProvider _serviceProvider;

        public RulesRepositoryHealthCheck(IRulesRepository repository, IConfiguration config, IServiceProvider serviceProvider)
        {
            _repository = repository;
            var failureDelayInMs = config.GetValue("Rules:FailureDelayInMs", 60000);
            _degradedTimeout = TimeSpan.FromMilliseconds(failureDelayInMs * 5);
            _unhealthyTimeout = TimeSpan.FromMilliseconds(failureDelayInMs * 60);
            _serviceProvider = serviceProvider;
        }


        public async Task<Microsoft.Extensions.Diagnostics.HealthChecks.HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                var tweek = _serviceProvider.GetService(typeof(ITweek));
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy($"Failed to init Tweek engine, ruleset version: {_repository.CurrentLabel}");
            }
            if (string.IsNullOrEmpty(_repository.CurrentLabel))
            {
                return HealthCheckResult.Unhealthy("No rules found");
            }
            if (DateTime.UtcNow - _repository.LastCheckTime > _unhealthyTimeout)
            {
                return HealthCheckResult.Unhealthy($"Rules version was last checked at ${_repository.LastCheckTime}. CurrentLabel = {_repository.CurrentLabel}");
            }
            if (DateTime.UtcNow - _repository.LastCheckTime > _degradedTimeout)
            {
                return HealthCheckResult.Degraded($"Rules version was last checked at ${_repository.LastCheckTime}. CurrentLabel = {_repository.CurrentLabel}");
            }
            if (!_repository.IsLatest)
            {
                return HealthCheckResult.Unhealthy($"Failed to update ruleset to latest version, CurrentLabel = {_repository.CurrentLabel}");
            }
            return HealthCheckResult.Healthy(
                $"CurrentLabel = {_repository.CurrentLabel}, LastCheckTime = {_repository.LastCheckTime}");
        }
    }
}
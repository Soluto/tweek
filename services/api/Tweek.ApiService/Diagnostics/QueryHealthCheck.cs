using System;
using System.Threading;
using System.Threading.Tasks;
using Tweek.Engine;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Tweek.ApiService.Diagnostics
{
    public class QueryHealthCheck : IHealthCheck
    {
        private readonly ITweek _tweek;
        private readonly IContextDriver _contextDriver;
        private HealthCheckResult _state = HealthCheckResult.Unhealthy(); 

        public QueryHealthCheck(ITweek tweek, IContextDriver contextDriver){
             _tweek = tweek;
             _contextDriver = contextDriver;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try{
                await _tweek.GetContextAndCalculate("@tweek/_", new System.Collections.Generic.HashSet<Identity> { new Identity("health_check", "test")  }, _contextDriver);
                _state = HealthCheckResult.Healthy();
            } catch (Exception ex){
                _state = HealthCheckResult.Unhealthy("Querying is not avilabile:" + ex.Message);
            }
            return _state;
        }
    }
}
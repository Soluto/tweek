using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using App.Metrics.Health;
using LanguageExt;
using Tweek.Engine;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using Microsoft.Extensions.DependencyInjection;

namespace Tweek.ApiService.Diagnostics
{
    public class QueryHealthCheck : HealthCheck
    {
        private readonly ITweek _tweek;
        private readonly IContextDriver _contextDriver;
        private HealthCheckResult _state = HealthCheckResult.Unhealthy(); 

        public QueryHealthCheck(ITweek tweek, IContextDriver contextDriver) : base("QueryHealthCheck"){
             _tweek = tweek;
             _contextDriver = contextDriver;
        }

        protected async override ValueTask<HealthCheckResult> CheckAsync(CancellationToken cancellationToken = default(CancellationToken)){
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
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
        private readonly IServiceProvider _serviceProvider;

        private HealthCheckResult _state = HealthCheckResult.Unhealthy(); 

        public QueryHealthCheck(IServiceProvider serviceProvider) : base("QueryHealthCheck"){
            _serviceProvider = serviceProvider;
        }

        protected async override Task<HealthCheckResult> CheckAsync(CancellationToken cancellationToken = default(CancellationToken)){
            var driver = _serviceProvider.GetService<IContextDriver>();
            var engine = _serviceProvider.GetService<ITweek>();
            try{
                await engine.GetContextAndCalculate("@tweek/_", new System.Collections.Generic.HashSet<Identity> { new Identity("health_check", "test")  }, driver);
                _state = HealthCheckResult.Healthy();
            } catch (Exception ex){
                _state = HealthCheckResult.Unhealthy("Querying is not avilabile:" + ex.Message);
            }
            return _state;
        }
    }
}
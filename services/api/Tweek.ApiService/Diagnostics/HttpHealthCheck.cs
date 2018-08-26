using System;
using System.Net.Http;
using System.Reflection;
using System.Threading;
using System.Threading.Tasks;
using App.Metrics.Health;

namespace Tweek.ApiService.Diagnostics
{
    public class HttpHealthCheck : HealthCheck
    {
        public HttpHealthCheck() : base("Http") { }

        protected async override ValueTask<HealthCheckResult> CheckAsync(CancellationToken cancellationToken = new CancellationToken()){ 
            var result = await (new HttpClient()).GetAsync("http://localhost/");
            if (!result.IsSuccessStatusCode){
                return HealthCheckResult.Unhealthy(result.StatusCode.ToString());
            }
            return HealthCheckResult.Healthy();
        }

        
    }
}
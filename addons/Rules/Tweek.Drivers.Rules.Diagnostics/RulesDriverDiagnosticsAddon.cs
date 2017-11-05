using System.Linq;
using Engine.Drivers.Rules;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.Addons;

namespace Tweek.Drivers.Rules.Diagnostics
{
    public class RulesDriverDiagnosticsAddon : ITweekAddon
    {
        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
        }

        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<IDiagnosticsProvider>(ctx => new RulesDriverHealthCheck(ctx.GetServices<IRulesDriver>().Single()));
        }
    }
}

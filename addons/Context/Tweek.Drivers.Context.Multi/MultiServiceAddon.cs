using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.Addons;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.Context.Multi
{
    public class MultiServiceAddon: ITweekAddon
    {
        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
        }

        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
          // need to figure out the settings
            services.AddSingleton<IContextDriver>(new MultiDriver(configuration.GetSection("MultiContext")));
        }
    }
}

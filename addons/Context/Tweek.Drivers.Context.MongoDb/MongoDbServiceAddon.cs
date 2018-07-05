using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.Addons;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.Context.MongoDb
{
    public class MongoDbServiceAddon: ITweekAddon
    {
        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
        }

        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton<IContextDriver>(new MongoDbDriver(configuration.GetSection("MongoDb")["ConnectionString"]));
        }
    }
}

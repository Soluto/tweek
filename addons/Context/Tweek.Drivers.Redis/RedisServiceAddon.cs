using System;
using Engine.Drivers.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.Addons;

namespace Tweek.Drivers.Redis
{
    public class RedisServiceAddon: ITweekAddon
    {
        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
        }

        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
            var contextDriver = new RedisDriver(configuration.GetSection("Redis")["ConnectionString"]);
            services.AddSingleton<IContextDriver>(contextDriver);
        }
    }
}

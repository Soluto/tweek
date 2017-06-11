using System;
using Engine.Drivers.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.Addons;

namespace Tweek.Drivers.LiteDBDriver
{
    public class LiteDBServiceAddon : ITweekAddon
    {
        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
            var collectionName = configuration["LiteDb.CollectionName"];
            var filePath = configuration["LiteDb.FilePath"];
            var contextDriver = new LiteDBDriver(collectionName, filePath);

            services.AddSingleton<IContextDriver>(contextDriver);
        }

        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
        }
    }

}

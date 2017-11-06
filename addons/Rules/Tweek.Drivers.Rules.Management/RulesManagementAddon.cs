using System;
using System.Net.Http;
using App.Metrics.Core.Abstractions;
using Engine.Drivers.Rules;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Tweek.ApiService.Addons;

namespace Tweek.Drivers.Rules.Management
{
    public class RulesManagementAddon : ITweekAddon
    {
        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
            
        }

        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
            var managementServiceUrl = new Uri(configuration.GetValue<string>("Rules:Management:Url"));
            var httpClient = new HttpClient
            {
                BaseAddress = managementServiceUrl
            };
            var settings = new TweekManagementRulesDriverSettings
            {
                SampleIntervalInMs = configuration.GetValue("Rules:Management:SampleIntervalInMs", 30000),
                FailureDelayInMs = configuration.GetValue("Rules:Management:FailureDelayInMs", 60000)
            };

            services.AddSingleton<IRulesDriver>(
                ctx => 
                TweekManagementRulesDriver.StartNew(httpClient.GetAsync, settings, ctx.GetService<ILoggerFactory>().CreateLogger("RulesManagementDriver"), 
                ctx.GetService<IMeasureMetrics>()));                
        }
    }
}

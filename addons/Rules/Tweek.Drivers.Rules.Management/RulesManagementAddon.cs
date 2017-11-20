using App.Metrics.Core.Abstractions;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Net.Http;
using Tweek.ApiService.Addons;
using Tweek.Engine.Drivers.Rules;

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
            var settings = new ManagementSettings
            {
                SampleIntervalInMs = configuration.GetValue("Rules:Management:SampleIntervalInMs", 30000),
            };

            services.AddSingleton<IRulesDriver>(ctx => new ManagementRulesDriver(httpClient.GetAsync, settings, ctx.GetService<IMeasureMetrics>()));
        }
    }
}

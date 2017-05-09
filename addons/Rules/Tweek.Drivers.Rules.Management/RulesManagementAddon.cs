using System;
using System.Net.Http;
using App.Metrics;
using Engine.Drivers.Rules;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Tweek.ApiService.Addons;
using System.Linq;
using App.Metrics.Health;
using App.Metrics.Core.Abstractions;
using LanguageExt;
using static LanguageExt.Prelude;
using LanguageExt.Trans.Linq;

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
            var httpClient = new HttpClient()
            {
                BaseAddress = managementServiceUrl
            };
            var settings = new TweekManagementRulesDriverSettings();
            configuration.GetValue<string>("Rules:Management:SampleIntervalInMs")?.Iter(x=> settings.SampleIntervalInMs = x);
            configuration.GetValue<string>("Rules:Management:FailureDelayInMs")?.Iter(x=> settings.FailureDelayInMs = x);

            services.AddSingleton<IRulesDriver>(
                ctx => 
                TweekManagementRulesDriver.StartNew(httpClient.GetAsync, settings, ctx.GetService<ILoggerFactory>().CreateLogger("RulesManagementDriver"), 
                ctx.GetService<IMeasureMetrics>()));

            services.AddSingleton<IDiagnosticsProvider>(ctx => new TweekManagementHealthCheck(ctx.GetServices<IRulesDriver>().OfType<TweekManagementRulesDriver>().Single()));
                
        }
    }
}

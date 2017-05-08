using System;
using System.Net.Http;
using App.Metrics;
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
        private ILogger _logger;
        private Uri _managementServiceUrl;
        public void Install(IApplicationBuilder builder, IConfiguration configuration, ILoggerFactory loggerFactory)
        {
            _logger = loggerFactory.CreateLogger("RulesManagementDriver");
            _managementServiceUrl = new Uri(configuration.GetValue<string>("Rules:Management"));
        }

        public void Register(IServiceCollection services, IConfiguration configuration)
        {
            var httpClient = new HttpClient()
            {
                BaseAddress = _managementServiceUrl
            };

            services.AddSingleton<IRulesDriver, TweekManagementRulesDriver>(
                ctx => TweekManagementRulesDriver.StartNew(HttpUtils.FromHttpClient(httpClient), _logger,
                    ctx.GetService<IMetrics>()));

            services.AddSingleton<IDiagnosticsProvider>(
                ctx => new TweekManagementHealthCheck(ctx.GetService<TweekManagementRulesDriver>()));

        }
    }
}

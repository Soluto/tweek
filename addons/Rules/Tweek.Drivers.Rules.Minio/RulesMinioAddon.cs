using System.Linq;
using App.Metrics.Core.Abstractions;
using Engine.Drivers.Rules;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Tweek.ApiService.Addons;

namespace Tweek.Drivers.Rules.Minio
{
    public class RulesMinioAddon : ITweekAddon
    {
        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
        }

        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
            var minioConfiguration = configuration.GetSection("Rules:Minio");

            var settings = new MinioRulesDriverSettings
            {
                SampleIntervalInMs = minioConfiguration.GetValue("SampleIntervalInMs", 30000),
                FailureDelayInMs = minioConfiguration.GetValue("FailureDelayInMs", 60000),
            };

            services.AddSingleton(new TweekMinioClient(
                minioConfiguration.GetValue("Bucket", "tweek-ruleset"),
                minioConfiguration.GetValue<string>("Endpoint"),
                minioConfiguration.GetValueFromEnvOrFile("AccessKey", "AccessKeyPath"),
                minioConfiguration.GetValueFromEnvOrFile("SecretKey", "SecretKeyPath"),
                minioConfiguration.GetValue("Secure", false)
            ));

            services.AddSingleton<IRulesDriver>(ctx => new MinioRulesDriver(ctx.GetService<TweekMinioClient>(),
                settings, ctx.GetService<ILoggerFactory>().CreateLogger("RulesMinioDriver")));
        }
    }
}

using Engine.Drivers.Rules;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
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

            var minioSettings = new MinioSettings
            {
                Endpoint = minioConfiguration.GetValue<string>("Endpoint"),
                Bucket = minioConfiguration.GetValue("Bucket", "tweek-ruleset"),
                AccessKey = minioConfiguration.GetValueFromEnvOrFile("AccessKey", "AccessKeyPath"),
                SecretKey = minioConfiguration.GetValueFromEnvOrFile("SecretKey", "SecretKeyPath"),
                IsSecure = minioConfiguration.GetValue("Secure", false),
            };

            services.AddSingleton<IRulesProvider>(new MinioRulesProvider(minioSettings, configuration.GetValue<string>("Rules:Nats:Endpoint")));
        }
    }
}
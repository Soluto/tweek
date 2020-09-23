using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.Addons;
using Tweek.Engine.Drivers.Rules;

namespace Tweek.Drivers.Rules.FileSystem
{
    public class RulesFileSystemAddon : ITweekAddon
    {
        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
        }

        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
            var fileSystemConfiguration = configuration.GetSection("Rules:FileSystem");
            var filePath = fileSystemConfiguration.GetValue<string>("FilePath");

            services.AddSingleton<IRulesDriver>(new FileSystemRulesDriver(filePath));
        }
    }
}

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace Tweek.ApiService.Security
{
    public static class AuthenticationProviderExtensions
    {
        public static void ConfigureAuthenticationProviders(this IServiceCollection app, IConfiguration configuration, ILogger logger)
        {
            var builder = app.AddAuthentication(JwtBearerDefaults.AuthenticationScheme);
            new InternalAuthenticationProvider().Install(builder, configuration, logger);
            new JwtAuthenticationProvider().Install(builder, configuration, logger);
        }
    }
}

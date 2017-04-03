using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Tweek.ApiService.NetCore.Security
{
    public static class AuthenticationProviderExtensions
    {
        public static void UseAuthenticationProviders(this IApplicationBuilder app, IConfiguration configuration, ILogger logger)
        {
            new InternalAuthenticationProvider().Install(app, configuration, logger);
            new JwtAuthenticationProvider().Install(app, configuration, logger);
        }
    }
}

using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;

namespace Tweek.ApiService.NetCore.Security
{
    public static class AuthenticationProviderExtensions
    {
        public static void UseAuthenticationProviders(this IApplicationBuilder app, IConfiguration configuration)
        {
            new InternalAuthenticationProvider().Install(app, configuration);
            new JwtAuthenticationProvider().Install(app, configuration);
        }
    }
}

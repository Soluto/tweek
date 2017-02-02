using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.Addons;

namespace Tweek.Addons.Auth.IdentityServer
{
    [AuthenticationProvider(Name = "IdentityServer")]
    public class IdentityServerAuthenticationProvider : ITweekAddon
    {
        public void Install(IApplicationBuilder app, IConfiguration configuration)
        {
            app.UseIdentityServerAuthentication(new IdentityServerAuthenticationOptions
            {
                RequireHttpsMetadata = false,
                Authority = configuration["Authority"]
            });
        }
    }
}

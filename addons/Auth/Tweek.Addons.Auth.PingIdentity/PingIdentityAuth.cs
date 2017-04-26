using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.Addons;
using Microsoft.Extensions.Options;

namespace Tweek.Addons.Auth.PingIdentity
{
    public class PingIdentityAuth : ITweekAddon
    {
        void ITweekAddon.Install(IApplicationBuilder builder, IConfiguration configuration)
        {
            var pingIdentityConfig = configuration.GetSection("Security:PingIdentityAddon");
            if (String.IsNullOrWhiteSpace(pingIdentityConfig["Authority"])) return;

            builder.UseMiddleware<PingIdentityMiddleware>(Options.Create(new PingIdentityOptions(){
                    Issuer = pingIdentityConfig["Issuer"],
                    Authority = pingIdentityConfig["Authority"]
                }));
        }

        public void Register(IServiceCollection services, IConfiguration configuration)
        {
        }
    }
}

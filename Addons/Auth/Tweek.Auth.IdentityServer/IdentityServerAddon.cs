using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Tweek.Auth.IdentityServer
{
    public class IdentityServerAddon
    {
        public void Use(IApplicationBuilder app, IHostingEnvironment env, IConfigurationRoot configuration, ILoggerFactory loggerFactory)
        {

            app.UseIdentityServerAuthentication(new IdentityServerAuthenticationOptions()
            {
                Authority = configuration["Authority"],
                AllowedScopes = {"all"}
            });
        }
    }
}

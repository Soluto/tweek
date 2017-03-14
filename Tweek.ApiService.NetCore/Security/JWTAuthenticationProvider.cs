using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Tweek.ApiService.Addons;

namespace Tweek.ApiService.NetCore.Security
{
    public static class JWTAuthenticationProviderExtensions
    {
        public static void UseJwtAuthenticationProviders(this IApplicationBuilder app, IConfiguration configuration) 
            => new JWTAuthenticationProvider().Install(app, configuration);
    }

    public class JWTAuthenticationProvider
    {
        public void Install(IApplicationBuilder app, IConfiguration configuration)
        {
            
            foreach (var authProvider in configuration.GetSection("Security:Providers").GetChildren())
            {
                app.UseJwtBearerAuthentication(new JwtBearerOptions()
                {
                    TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters()
                    {
                        ValidIssuer = authProvider["Issuer"],
                        ValidateAudience = false
                    },
                    RequireHttpsMetadata = false,
                    Authority = authProvider["Authority"]
                });
            }
        }
    }
}

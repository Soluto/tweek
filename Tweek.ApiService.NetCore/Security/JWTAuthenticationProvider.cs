using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Tweek.ApiService.Addons;

namespace Tweek.ApiService.NetCore.Security
{
    public class JWTAuthenticationProvider: ITweekAddon
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

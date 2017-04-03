using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Tweek.ApiService.NetCore.Security
{
     public class JwtAuthenticationProvider
    {
        public void Install(IApplicationBuilder app, IConfiguration configuration)
        {
            foreach (var authProvider in configuration.GetSection("Security:Providers").GetChildren())
            {
                app.UseJwtBearerAuthentication(new JwtBearerOptions
                {
                    TokenValidationParameters = new TokenValidationParameters
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

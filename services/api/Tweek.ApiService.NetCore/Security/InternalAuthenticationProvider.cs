using System.IO;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace Tweek.ApiService.NetCore.Security
{
    public class InternalAuthenticationProvider
    {
        public void Install(IApplicationBuilder app, IConfiguration configuration)
        {
            try
            {
                var gitPublicKeyPath = configuration.GetValue<string>("PUBLIC_KEY_PATH");
                if (!string.IsNullOrEmpty(gitPublicKeyPath) && File.Exists(gitPublicKeyPath))
                {
                    app.UseJwtBearerAuthentication(new JwtBearerOptions
                    {
                        TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidIssuer = "tweek",
                            ValidateAudience = false,
                            IssuerSigningKey = new X509SecurityKey(new X509Certificate2(gitPublicKeyPath))
                        },
                        RequireHttpsMetadata = false,
                        AuthenticationScheme = "tweekinternal"
                    });
                }
            }
            catch { }
        }
    }
}

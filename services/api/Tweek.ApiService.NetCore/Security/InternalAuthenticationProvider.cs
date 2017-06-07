using System;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace Tweek.ApiService.NetCore.Security
{
    public class InternalAuthenticationProvider
    {
        public void Install(IApplicationBuilder app, IConfiguration configuration, ILogger logger)
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
                        AutomaticAuthenticate = false,
                        AutomaticChallenge = false,
                        RequireHttpsMetadata = false,
                        AuthenticationScheme = "JWT tweek"
                    });
                    logger.LogInformation("Tweek certificate was loaded successfully");
                }
                else{
                    logger.LogInformation("No Tweek certificate defined");
                }
            }
            catch (Exception e){
                logger.LogError("Failed to load certificate", e);
             }
        }
    }
}

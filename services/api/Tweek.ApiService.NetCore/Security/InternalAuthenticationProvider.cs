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
            var keyPath = configuration.GetValue<string>("PUBLIC_KEY_PATH");
            if (String.IsNullOrEmpty(keyPath) && !String.IsNullOrEmpty(configuration.GetValue<string>("PUBLIC_KEY_INLINE"))){
                var inlineData = Convert.FromBase64String(configuration.GetValue<string>("PUBLIC_KEY_INLINE"));
                keyPath = Path.Combine(Path.GetTempPath(), "tweek.pfx");
                File.WriteAllBytes(keyPath, inlineData);
            }

            try
            {
                if (!string.IsNullOrEmpty(keyPath) && File.Exists(keyPath))
                {
                    app.UseJwtBearerAuthentication(new JwtBearerOptions
                    {
                        TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidIssuer = "tweek",
                            ValidateAudience = false,
                            IssuerSigningKey = new X509SecurityKey(new X509Certificate2(keyPath))
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

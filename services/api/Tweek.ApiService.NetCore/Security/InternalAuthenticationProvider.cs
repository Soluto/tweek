using System;
using System.IO;
using System.Security.Cryptography.X509Certificates;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;

namespace Tweek.ApiService.NetCore.Security
{
    public class InternalAuthenticationProvider
    {
        public void Install(AuthenticationBuilder app, IConfiguration configuration, ILogger logger)
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
                    app.AddJwtBearer("JWT tweek", options =>
                    {
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidIssuer = "tweek",
                            ValidateAudience = false,
                            IssuerSigningKey = new X509SecurityKey(new X509Certificate2(keyPath))
                        };
                        options.RequireHttpsMetadata = false;
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

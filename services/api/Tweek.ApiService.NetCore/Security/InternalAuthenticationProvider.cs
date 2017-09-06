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
            try
            {
                var gitPublicKeyPath = configuration.GetValue<string>("PUBLIC_KEY_PATH");
                if (!string.IsNullOrEmpty(gitPublicKeyPath) && File.Exists(gitPublicKeyPath))
                {
                    app.AddJwtBearer("JWT tweek", options =>
                    {
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidIssuer = "tweek",
                            ValidateAudience = false,
                            IssuerSigningKey = new X509SecurityKey(new X509Certificate2(gitPublicKeyPath))
                        };
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

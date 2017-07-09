using System;
using System.Collections.Immutable;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using LanguageExt;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using static LanguageExt.Prelude;
using LanguageExt.Trans.Linq;

namespace Tweek.ApiService.NetCore.Security
{
     public class JwtAuthenticationProvider
    {
        private static string GetAuthToken(HttpContext ctx)
        {
            var authorizationHeader = ctx.Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authorizationHeader)) return null;

            if (!authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)) return null;
            var jwtString = authorizationHeader.Substring("Bearer ".Length).Trim();
            if (string.IsNullOrEmpty(jwtString)) return null;
            return jwtString;
        }

        public void Install(IApplicationBuilder app, IConfiguration configuration, ILogger logger)
        {
            var authProviders = configuration.GetSection("Security:Providers").GetChildren().ToArray();

            authProviders.Iter(authProvider =>
            {
                app.UseJwtBearerAuthentication(new JwtBearerOptions
                {
                    TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidIssuer = authProvider["Issuer"],
                        ValidateAudience = false
                    },
                    RequireHttpsMetadata = false,
                    Authority = authProvider["Authority"],
                    AutomaticAuthenticate = false,
                    AutomaticChallenge = false,
                    AuthenticationScheme = $"JWT {authProvider["Issuer"]}"
                });
            });

            var issuers = authProviders.Map(authProvider => authProvider["Issuer"])
                .Append("tweek")
                .ToImmutableHashSet();

            app.Use( async (ctx, next) =>
            {
                var jwtString = GetAuthToken(ctx);
                if (jwtString != null)
                {
                    var jwtSecurityTokenHandler = new JwtSecurityTokenHandler();
                    JwtSecurityToken jwtSecurityToken;
                    try
                    {
                        jwtSecurityToken = (JwtSecurityToken)jwtSecurityTokenHandler.ReadToken(jwtString);
                    }
                    catch
                    {
                        ctx.Response.StatusCode = 400;
                        return;
                    }
                    var issuer = jwtSecurityToken.Issuer;
                    if (issuers.Contains(issuer)) {
                        ctx.User = await ctx.Authentication.AuthenticateAsync($"JWT {issuer}");
                    }
                }

                await next();
            });
        }
    }
}

using System;
using System.Collections.Immutable;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace Tweek.ApiService.NetCore.Security
{
    public class JwtAuthenticationSchemeOptions : AuthenticationSchemeOptions {
        public ImmutableHashSet<string> AuthProviders {get;set;}
    }

    public class JwtAuthenticationHandler : AuthenticationHandler<JwtAuthenticationSchemeOptions>
    {
        public JwtAuthenticationHandler(IOptionsMonitor<JwtAuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock) 
            : base(options, logger, encoder, clock)
        { }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            var jwtString = GetAuthToken();
            if (!string.IsNullOrEmpty(jwtString))
            {
                var jwtSecurityTokenHandler = new JwtSecurityTokenHandler();
                JwtSecurityToken jwtSecurityToken;
                try
                {
                    jwtSecurityToken = (JwtSecurityToken) jwtSecurityTokenHandler.ReadToken(jwtString);
                }
                catch (Exception e)
                {
                    return AuthenticateResult.Fail(e);
                }

                var issuer = jwtSecurityToken.Issuer;

                if (Options.AuthProviders.Contains(issuer))
                {
                    return await Context.AuthenticateAsync($"JWT {issuer}");
                }
            }
            return AuthenticateResult.NoResult();
        }

        private string GetAuthToken()
        {
            var authorizationHeader = Request.Headers["Authorization"].ToString();
            if (string.IsNullOrEmpty(authorizationHeader)) return null;

            const string bearer = "Bearer ";
            if (!authorizationHeader.StartsWith(bearer, StringComparison.OrdinalIgnoreCase)) return null;
            return authorizationHeader.Substring(bearer.Length).Trim();
        }
    }

    public class JwtAuthenticationProvider
    {
        public void Install(AuthenticationBuilder app, IConfiguration configuration, ILogger logger)
        {
            var authProviders = configuration.GetSection("Security:Providers").GetChildren();
            authProviders.Aggregate(app, (builder, authProvider) =>
            {
                return builder.AddJwtBearer($"JWT {authProvider["Issuer"]}", options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidIssuer = authProvider["Issuer"],
                        ValidateAudience = false
                    };
                    options.Authority = authProvider["Authority"];
                    options.RequireHttpsMetadata = false;
                });
            });

            var optionsAuthProvider = authProviders.Select(x => x["Issuer"])
                .Append("tweek")
                .ToImmutableHashSet();

            app.AddScheme<JwtAuthenticationSchemeOptions, JwtAuthenticationHandler>(JwtBearerDefaults.AuthenticationScheme, options => options.AuthProviders = optionsAuthProvider);
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Tweek.ApiService.Addons;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.Http.Authentication;
using Microsoft.AspNetCore.Http.Features.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Text.Encodings.Web;
using Microsoft.Extensions.DependencyInjection;

namespace Tweek.ApiService.NetCore.Security
{
    public class TweekLegacyHandler : AuthenticationHandler<TweekLegacyOptions>
    {
        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            if (Request.Query.ContainsKey("$tweeklegacy"))
            {
                return AuthenticateResult.Success(
                    new AuthenticationTicket(
                        new ClaimsPrincipal(new ClaimsIdentity(new[] {new Claim("iss", "TweekLegacy")})), null,
                        "TweekLegacy"));
            }
            return AuthenticateResult.Skip();
        }
    }

    public class TweekLegacyOptions : AuthenticationOptions
    {
        public TweekLegacyOptions()
        {
            AutomaticAuthenticate = true;
            AutomaticChallenge = true;
        }
    }

    public class TweekLegacySupportMiddleware : AuthenticationMiddleware<TweekLegacyOptions>
    {
        public TweekLegacySupportMiddleware(RequestDelegate next, IOptions<TweekLegacyOptions> options, ILoggerFactory loggerFactory, UrlEncoder encoder) : base(next, options, loggerFactory, encoder)
        {
        }

        protected override AuthenticationHandler<TweekLegacyOptions> CreateHandler()
        {
            return new TweekLegacyHandler();
        }
    }

    public class TweekLegacySupport : ITweekAddon
    {
        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
            builder.UseRewriter(new RewriteOptions().AddRewrite("^configurations/([^?]+)[?]?(.*)", "api/v1/keys/$1?$tweeklegacy=tweeklegacy&$ignoreKeyTypes=true&$2", true));
            builder.UseMiddleware<TweekLegacySupportMiddleware>();
        }

        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
        }
    }
}

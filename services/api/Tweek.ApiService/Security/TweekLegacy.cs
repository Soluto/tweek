using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Threading.Tasks;
using Tweek.ApiService.Addons;

namespace Tweek.ApiService.Security
{
    public class TweekLegacyHandler : AuthenticationHandler<AuthenticationSchemeOptions>
    {
        public TweekLegacyHandler(IOptionsMonitor<AuthenticationSchemeOptions> options, ILoggerFactory logger, UrlEncoder encoder, ISystemClock clock) : base(options, logger, encoder, clock)
        {
            
        }

        protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
        {
            return AuthenticateResult.Success(
                    new AuthenticationTicket(
                        new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim("iss", "TweekLegacy") })),
                        "TweekLegacy"));
        }
    }
    
    public class TweekLegacySupport : ITweekAddon
    {
        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
            builder.UseRewriter(new RewriteOptions().AddRewrite("^configurations/([^?]+)[?]?(.*)", "api/v1/keys/$1?$tweeklegacy=tweeklegacy&$ignoreKeyTypes=true&$2", true));
            builder.Use(async (ctx, next) =>
            {
                if (ctx.Request.Query.ContainsKey("$tweeklegacy"))
                {
                    var result = await ctx.AuthenticateAsync("TweekLegacy");
                    if (result?.Principal != null)
                    {
                        ctx.User = result.Principal;
                    }
                }
                await next();
            });
        }

        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
            services.AddAuthentication().AddScheme<AuthenticationSchemeOptions, TweekLegacyHandler>("TweekLegacy", null, o =>
                {
                    o.ClaimsIssuer = "TweekLegacy";
                });
        }
    }
}

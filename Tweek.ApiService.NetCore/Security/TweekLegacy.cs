using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Tweek.ApiService.Addons;
using System.Security.Claims;

namespace Tweek.ApiService.NetCore.Security
{
    [AuthenticationProvider(Name = "TweekLegacy")]
    public class TweekLegacyAuthenticationProvider : ITweekAddon
    {
        public void Install(IApplicationBuilder builder, IConfiguration configuration)
        {
            builder.Use(next => (ctx) => {
                if (ctx.Request.Path.StartsWithSegments("configurations") && ctx.User.Identity.IsAuthenticated)
                {

                    ctx.User.AddIdentity(new ClaimsIdentity(new[] { new Claim("iss", "TweekLegacy") }));
                }
                return next(ctx);
                }
            );
        }
    }
}

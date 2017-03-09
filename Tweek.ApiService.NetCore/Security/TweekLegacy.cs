using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Tweek.ApiService.Addons;
using System.Security.Claims;
using Microsoft.AspNetCore.Rewrite;

namespace Tweek.ApiService.NetCore.Security
{
    public class TweekLegacySupport : ITweekAddon
    {
        public void Install(IApplicationBuilder builder, IConfiguration configuration)
        {
            builder.UseRewriter(new RewriteOptions().AddRewrite("^configurations/([^?]+)[?]?(.*)", "v1/keys/$1?$tweeklegacy=tweeklegacy&$ignoreKeyTypes=true&$2", true));
            builder.UseRewriter(new RewriteOptions().AddRewrite("^context/([^?]+)[?]?(.*)", "v1/context/$1?$tweeklegacy=tweeklegacy&$2", true));
            builder.Use(next => (ctx) => {
              if (ctx.Request.Query.ContainsKey("$tweeklegacy"))
                {
                    ctx.User.AddIdentity(new ClaimsIdentity(new[] { new Claim("iss", "TweekLegacy") }));
                }
                return next(ctx);
                }
            );
        }
    }
}

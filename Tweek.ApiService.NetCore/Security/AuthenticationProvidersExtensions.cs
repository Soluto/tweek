using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Tweek.ApiService.NetCore.Addons;

namespace Tweek.ApiService.NetCore.Security
{
    public static class AuthenticationProvidersExtensions
    {
        public static void UseAuthenticationProviders(this IApplicationBuilder app, IConfigurationRoot configuration, AddonsList addonsList)
        {
            foreach (var authProvider in configuration.GetSection("Security:Providers").GetChildren())
            {
                addonsList.GetAuthenticationProvider(app, authProvider["Type"]).IfSome(x => x.Install(app, authProvider));
            }
        }
    }
}

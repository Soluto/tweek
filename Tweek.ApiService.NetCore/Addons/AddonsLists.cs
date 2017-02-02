using System;
using System.Reflection;
using LanguageExt;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Tweek.ApiService.Addons;

namespace Tweek.ApiService.NetCore.Addons
{
    public class AddonsList
    {
        public AddonsList()
        {
            Types = AppDomain.CurrentDomain.GetAssemblies().Bind(x => x.GetTypes()).Filter(x => x.IsAssignableFrom(typeof(ITweekAddon))).ToArray();
        }
        public readonly Type[] Types;
    }
    public static class AddonsListExtensions
    {
        public static Option<ITweekAddon> GetAuthenticationProvider(this AddonsList addons, IApplicationBuilder app, string name)
        {
            return addons.Types.Find(t => t.GetCustomAttributes<AuthenticationProviderAttribute>().Exists(a => a.Name == name)).Map(t => (ITweekAddon)app.ApplicationServices.GetService(t));
        }
    }

}

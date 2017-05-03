using System;
using System.Collections.Generic;
using System.Reflection;
using LanguageExt;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Tweek.ApiService.Addons;
using Microsoft.Extensions.DependencyModel;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Tweek.ApiService.NetCore.Addons
{
    public static class AddonsListExtensions
    {
        public static void InstallAddons(this IApplicationBuilder app, IConfiguration configuration)
        {
            ForEachAddon(configuration, addon => addon.Install(app, configuration));
        }

        public static void RegisterAddonServices(this IServiceCollection services, IConfiguration configuration)
        {
            ForEachAddon(configuration, addon => addon.Register(services, configuration));
        }

        private static void ForEachAddon(IConfiguration configuration, Action<ITweekAddon> action)
        {
            foreach (var tweekAddon in GetAddons(configuration))
            {
                action(tweekAddon);
            }
        }

        private static IEnumerable<ITweekAddon> GetAddons(IConfiguration configuration)
        {
            if (mAddonsCache != null) return mAddonsCache;

            var selectedAddons = configuration.GetSection("Addons").GetChildren().ToDictionary(x => x.Key, x => x.Value);
            var dependencies = DependencyContext.Default.RuntimeLibraries;

            var assemblies = dependencies
                .SelectMany(library => library.GetDefaultAssemblyNames(DependencyContext.Default).Select(Assembly.Load));

            var addonTypes = assemblies.Bind(x => x.GetTypes())
                .Filter(x => x != typeof(ITweekAddon) && typeof(ITweekAddon).IsAssignableFrom(x));

            mAddonsCache = addonTypes.Filter(type => selectedAddons.ContainsKey(type.FullName))
                .Map(t => (ITweekAddon)Activator.CreateInstance(t));

            return mAddonsCache;
        }

        private static IEnumerable<ITweekAddon> mAddonsCache;
    }
}

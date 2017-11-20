using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace Tweek.ApiService.Addons
{
    public static class AddonsListExtensions
    {
        public static void InstallAddons(this IApplicationBuilder app, IConfiguration configuration)
        {
            ForEachAddon(configuration, addon => addon.Use(app, configuration));
        }

        public static void RegisterAddonServices(this IServiceCollection services, IConfiguration configuration)
        {
            ForEachAddon(configuration, addon => addon.Configure(services, configuration));
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

            var selectedAddons = new System.Collections.Generic.HashSet<string>(
                configuration.GetSection("Addons")
                    .GetChildren()
                    .Select(x => Assembly.CreateQualifiedName(x["AssemblyName"], x["ClassName"]))
            );

            var dependencies = DependencyContext.Default.RuntimeLibraries;

            var assemblies = dependencies
                .SelectMany(library =>
                    library.GetDefaultAssemblyNames(DependencyContext.Default).Select(Assembly.Load));

            var addonTypes = assemblies.Bind(x => x.GetTypes())
                .Filter(x => x != typeof(ITweekAddon) && typeof(ITweekAddon).IsAssignableFrom(x));

            mAddonsCache = addonTypes
                .Filter(type => selectedAddons.Contains(type.AssemblyQualifiedNameWithoutVersion()))
                .Map(t => (ITweekAddon) Activator.CreateInstance(t));

            return mAddonsCache;
        }

        private static IEnumerable<ITweekAddon> mAddonsCache;

        private static string AssemblyQualifiedNameWithoutVersion(this Type type)
        {
            return Assembly.CreateQualifiedName(type.GetTypeInfo().Assembly.GetName().Name, type.FullName);
        }
    }
}
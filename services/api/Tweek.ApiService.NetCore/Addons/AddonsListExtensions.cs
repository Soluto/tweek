using System;
using System.Collections.Generic;
using System.Reflection;
using LanguageExt;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Tweek.ApiService.Addons;
using Microsoft.Extensions.PlatformAbstractions;
using Microsoft.Extensions.DependencyModel;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Tweek.ApiService.NetCore.Addons
{
    public static class AddonsListExtensions
    {
        public static void InstallAddons(this IApplicationBuilder app, IConfiguration configuration)
        {
            var selectedAddons = configuration.GetSection("Addons").GetChildren().ToDictionary(x=>x.Key, x=>x.Value);

            var addonTypes = GetAddonTypes<ITweekAddon>(selectedAddons.Keys);

            foreach  (ITweekAddon addon in addonTypes
                .Filter(addonType=> selectedAddons.ContainsKey(addonType.FullName))
                .Map(t => (ITweekAddon)Activator.CreateInstance(t))) {
                addon.Install(app, configuration);
            }
        }

        public static void InstallServiceAddons(this IServiceCollection services, IConfiguration configuration)
        {
            var selectedServiceAddons = configuration.GetSection("ServiceAddons").GetChildren().ToDictionary(x=>x.Key, x=>x.Value);

            var addonTypes = GetAddonTypes<ITweekAddon>(selectedServiceAddons.Keys);

            foreach (var addon in addonTypes.Map(t => (ITweekAddon)Activator.CreateInstance(t)))
            {
                addon.Register(services, configuration);
            }
        }

        private static IEnumerable<Type> GetAddonTypes<TInterface>(IEnumerable<string> typeNames)
        {
            var dependencies = DependencyContext.Default.RuntimeLibraries;

            var assemblies = dependencies
                .SelectMany(library => library.GetDefaultAssemblyNames(DependencyContext.Default).Select(Assembly.Load));

            var addonTypes = assemblies.Bind(x => x.GetTypes())
                .Filter(x => x != typeof(TInterface) && typeof(TInterface).IsAssignableFrom(x));

            return addonTypes.Filter(type =>typeNames.Contains(type.FullName));
        }
    }
}

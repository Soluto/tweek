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

            var addonTypes = GetAddonTypes<ITweekServiceAddon>(selectedServiceAddons.Keys);

            foreach (var addon in addonTypes.Map(t => (ITweekServiceAddon)Activator.CreateInstance(t)))
            {
                addon.Register(services, configuration);
            }
        }

        private static IEnumerable<Type> GetAddonTypes<TInterface>(IEnumerable<string> typeNames)
        {
            var dependencies = DependencyContext.Default.RuntimeLibraries;

            var assemblies = dependencies.SelectMany(dep =>
            {
                try
                {

                    return new[] { Assembly.Load(new AssemblyName(dep.Name)) };
                }
                catch (Exception)
                {
                    return new Assembly[] { };
                }
            }).ToArray();

            var addonTypes = assemblies.Bind(x =>
            {
                try
                {
                    return x.GetTypes();
                }
                catch (Exception)
                {
                    return new Type[] { };
                }
            }).Filter(x => x != typeof(TInterface) && typeof(TInterface).IsAssignableFrom(x)).ToArray();

            return addonTypes.Filter(type =>typeNames.Contains(type.FullName));
        }
    }
}

using System;
using System.Reflection;
using LanguageExt;
using System.Linq;
using Microsoft.AspNetCore.Builder;
using Tweek.ApiService.Addons;
using Microsoft.Extensions.PlatformAbstractions;
using Microsoft.Extensions.DependencyModel;
using Microsoft.Extensions.Configuration;

namespace Tweek.ApiService.NetCore.Addons
{
    public static class AddonsListExtensions
    {
        public static void InstallAddons(this IApplicationBuilder app, IConfiguration configuration)
        {

            var dependencies = DependencyContext.Default.RuntimeLibraries;
            var assemblies = dependencies.SelectMany(dep =>
            {
                try
                {

                    return new[] { Assembly.Load(new AssemblyName(dep.Name)) };
                }
                catch (Exception ex)
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
                catch (Exception ex)
                {
                    return new Type[] {};
                }
            }).Filter(x => x != typeof(ITweekAddon) && typeof(ITweekAddon).IsAssignableFrom(x)).ToArray();

            foreach  (ITweekAddon addon in addonTypes.Map(t => (ITweekAddon)Activator.CreateInstance(t))) { 
                addon.Install(app, configuration);
            }
        }
    }
}

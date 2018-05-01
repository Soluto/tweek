using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Reflection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyModel;
using Tweek.ApiService.Addons;
using Tweek.ApiService.Utils;
using Tweek.Engine.Drivers.Context;

namespace Tweek.ApiService.MultiContext
{
    public static class MultiContextExtensions
    {
        public static IEnumerable<IContextDriver> GetAllContextDrivers(this IServiceCollection services, IConfiguration configuration, IEnumerable<string> names)
        {
            var addonConfiguration = configuration.GetSection("Addons");
            var dependencies = DependencyContext.Default.RuntimeLibraries;

            var assemblies = dependencies
                .SelectMany(library =>
                    library.GetDefaultAssemblyNames(DependencyContext.Default).Select(Assembly.Load));
            var selectedAddons = new HashSet<string>(
                    names
                    .Where(x => !string.IsNullOrEmpty(x))
                    .Select(addon => addonConfiguration.GetSection(addon))
                    .Select(x => Assembly.CreateQualifiedName(x["AssemblyName"], x["ClassName"]))
            );

            var addonTypes = assemblies.Bind(x => x.GetExportedTypes())
                .Filter(x => x != typeof(ITweekAddon) && typeof(ITweekAddon).IsAssignableFrom(x));
            var drivers = addonTypes
                .Filter(type => selectedAddons.Contains(type.AssemblyQualifiedNameWithoutVersion()))
                .Map(t => (ITweekAddon) Activator.CreateInstance(t));

            foreach (var driver in drivers)
            {
                driver.Configure(services, configuration);
            }

            var serviceDescriptors = services.GetDescriptorsByType(typeof(IContextDriver));
            return serviceDescriptors.Select(d => (IContextDriver) d.ImplementationInstance);
        }

        public static void RemoveAllContextDrivers(this IServiceCollection services)
        {
            var serviceDescriptors = services.GetDescriptorsByType(typeof(IContextDriver)).ToArray();
            foreach (var descriptor in serviceDescriptors)
            {
                services.Remove(descriptor);
            }
        }

        private static IEnumerable<ServiceDescriptor> GetDescriptorsByType(this IServiceCollection services, Type type)
        {
            return services.Where(descriptor => descriptor.ServiceType == type);
        }
    }
}
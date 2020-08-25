using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using System.Reflection;
using Couchbase.Search;
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
        public static IDictionary<string, IContextDriver> SetupAllContextDrivers(this IServiceCollection services,
            IConfiguration configuration, IEnumerable<string> names)
        {
            var addonConfiguration = configuration.GetSection("Addons");

            var selectedAddons = new HashSet<string>(
                names
                    .Where(x => !string.IsNullOrEmpty(x))
                    .Select(addon => addonConfiguration.GetSection(addon))
                    .Select(x => Assembly.CreateQualifiedName(x["AssemblyName"], x["ClassName"]))
            );

            var drivers = AddonsListExtensions.GetSelectedAddons(selectedAddons);

            foreach (var driver in drivers)
            {
                driver.Configure(services, configuration);
            }

            var serviceDescriptors = services.GetDescriptorsByType(typeof(IContextDriver)).ToArray();
            var assemblyNamesToAddonName = addonConfiguration.GetChildren()
                .ToDictionary(addon => addon.GetValue<string>("AssemblyName"), addon => addon.Key);

            return serviceDescriptors.ToDictionary(
                descriptor => assemblyNamesToAddonName[descriptor.ImplementationInstance.GetType().GetTypeInfo().Assembly.GetName().Name],
                descriptor => (IContextDriver) descriptor.ImplementationInstance);
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
using System;
using System.Collections.Generic;
using System.ComponentModel.Design;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.Context.Multi
{
    public static class DependencyExtensions
    {
        public static IEnumerable<IContextDriver> GetAllContextDrivers(this IServiceCollection services)
        {
            var serviceDescriptors = services.GetDescriptorsByType(typeof(IContextDriver));
            return serviceDescriptors.Select(d => (IContextDriver) d.ImplementationInstance);
        }

        public static void RemoveAllContextDrivers(this IServiceCollection services)
        {
            var serviceDescriptors = services.GetDescriptorsByType(typeof(IContextDriver));
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
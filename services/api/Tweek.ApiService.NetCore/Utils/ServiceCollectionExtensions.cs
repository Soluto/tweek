using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;

namespace Tweek.ApiService.NetCore.Utils
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AdaptSingletons<TAdaptee, TAdaptor>(this IServiceCollection services,
            Func<TAdaptee, TAdaptor> adapter) where TAdaptor : class
        {
            var descriptors = services.Where(descriptor => descriptor.ServiceType == typeof(TAdaptee) && descriptor.Lifetime == ServiceLifetime.Singleton).ToArray();
            foreach (var serviceDescriptor in descriptors)
            {
                services.AddSingleton(adapter((TAdaptee) serviceDescriptor.ImplementationInstance));
            }

            return services;
        }
    }
}

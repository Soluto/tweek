using System;
using System.Collections.Generic;
using System.Linq;
using Engine.Drivers.Context;
using Microsoft.Extensions.DependencyInjection;

namespace Tweek.ApiService.Addons
{
    public static class ServiceRegistrationExtensions
    {
        private static readonly IDictionary<string, Func<IServiceProvider, IContextDriver>> contextDrivers =
            new Dictionary<string, Func<IServiceProvider, IContextDriver>>();

        public static IServiceCollection RegisterContextDriver(this IServiceCollection services,
            string driverName,
            Func<IServiceProvider, IContextDriver> contextFactory) 
        {
            contextDrivers.Add(driverName, contextFactory);
            return services;
        }

        public static IServiceCollection SelectContextProvider(this IServiceCollection services, string selectedProvider)
        {
            var contextProvider = contextDrivers[selectedProvider];
            contextDrivers.Remove(selectedProvider);

            services.AddSingleton(new ContextDriversRepository(contextDrivers));
            services.AddSingleton(provider => contextProvider.Invoke(provider));

            return services;
        }
    }

    public class ContextDriversRepository:
        Dictionary<string, Func<IServiceProvider, IContextDriver>>,
        IDictionary<string, Func<IServiceProvider, IContextDriver>>
    {
        public ContextDriversRepository(IDictionary<string, Func<IServiceProvider, IContextDriver>> contextDrivers)
            : base(contextDrivers)
        {
        }
    }

}
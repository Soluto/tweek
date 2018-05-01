using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.Addons;
using Tweek.ApiService.MultiContext;
using Tweek.ApiService.Utils;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.Context.Multi
{
    public class MultiServiceAddon: ITweekAddon
    {
        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
        }

        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
            var readersNames = configuration.GetValue<string>("MultiContext:Readers").Split(',').Select(n=>n.Trim()).ToArray();
            var writersNames = configuration.GetValue<string>("MultiContext:Writers").Split(',').Select(n=>n.Trim()).ToArray();
            
            var drivers = services.GetAllContextDrivers(configuration, readersNames.Concat(writersNames)).ToArray();
            services.RemoveAllContextDrivers();
            
            var readers = GetContextDrivers(drivers, configuration, readersNames);
            var writers = GetContextDrivers(drivers, configuration, writersNames);
            services.AddSingleton<IContextDriver>(new MultiDriver(readers, writers));
        }

        private static IEnumerable<IContextDriver> GetContextDrivers(IEnumerable<IContextDriver> drivers, IConfiguration configuration, IEnumerable<string> names)
        {
            var addons = configuration.GetSection("Addons").GetChildren();
            var assemblyNamesToAddonName = addons.ToDictionary(addon => addon.GetValue<string>("AssemblyName"), addon => addon.Key);
            return drivers.Where(d =>
            {
                var assemblyName = d.GetType().GetTypeInfo().Assembly.GetName().Name;
                return names.Any(name => name == DictionaryKeyOrNull(assemblyNamesToAddonName, assemblyName));
            });
        }

        private static string DictionaryKeyOrNull(Dictionary<string, string> dictionary, string key)
        {
            string result = null;
            dictionary.TryGetValue(key, out result);
            return result;
        }
    }
}

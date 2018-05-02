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
            
            var drivers = services.SetupAllContextDrivers(configuration, readersNames.Concat(writersNames));
            services.RemoveAllContextDrivers();
            
            var readers = GetContextDrivers(drivers, readersNames);
            var writers = GetContextDrivers(drivers, writersNames);
            services.AddSingleton<IContextDriver>(new MultiDriver(readers, writers));
        }

        private static IEnumerable<IContextDriver> GetContextDrivers(IDictionary<string,IContextDriver> drivers, IEnumerable<string> names)
        {
            return drivers.Where(kvPair => names.Contains(kvPair.Key)).Select(kvPair => kvPair.Value);
        }

        private static string DictionaryKeyOrNull(Dictionary<string, string> dictionary, string key)
        {
            string result = null;
            dictionary.TryGetValue(key, out result);
            return result;
        }
    }
}

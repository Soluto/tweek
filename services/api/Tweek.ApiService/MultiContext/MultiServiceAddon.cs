using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tweek.ApiService.Addons;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.Context.Multi
{
    [AddonName(Name="MultiContext")]
    public class MultiServiceAddon: ITweekAddon
    {
        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
        }

        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
            var drivers = services.GetAllContextDrivers();
            services.RemoveAllContextDrivers();
            var readersNames = configuration.GetValue<string>("MultiContext:Readers").Split(',').Select(n=>n.Trim());
            var writersNames = configuration.GetValue<string>("MultiContext:Writers").Split(',').Select(n=>n.Trim());
            var readers = GetContextDrivers(drivers, readersNames);
            var writers = GetContextDrivers(drivers, writersNames);
            services.AddSingleton<IContextDriver>(new MultiDriver(readers, writers));
        }

        private static IEnumerable<IContextDriver> GetContextDrivers(IEnumerable<IContextDriver> drivers, IEnumerable<string> names)
        {
            return drivers.Where(d =>
            {
                var attrName = d.GetType().GetCustomAttribute<AddonNameAttribute>()?.Name;
                return attrName != null && names.Any(name => name.Contains(attrName));
            });
        }
    }
}

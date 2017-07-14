using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Reflection;
using Tweek.ApiService.Addons;

namespace Tweek.ApiService.NetCore.Diagnostics
{
    public class EnvironmentDiagnosticsProvider : IDiagnosticsProvider
    {
        public string Name => "EnvironmentDetails";

        public string AppVersion =
            Assembly.GetEntryAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion;

        public object GetDetails()
        {
            return new {Host=Environment.MachineName, Version = AppVersion};
        }

        public bool IsAlive()
        {
            return true;
        }
    }
}

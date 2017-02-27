using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Tweek.ApiService.NetCore.Diagnostics
{
    public class EnvironmentDiagnosticsProvider : IDiagnosticsProvider
    {
        public string Name => "EnvironmentDetails";

        public string AppVersion =
            Microsoft.Extensions.PlatformAbstractions.PlatformServices.Default.Application.ApplicationVersion;

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

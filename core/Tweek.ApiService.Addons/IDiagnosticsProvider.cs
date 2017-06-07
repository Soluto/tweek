using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tweek.ApiService.Addons
{
    public interface IDiagnosticsProvider
    {
        string Name { get; }

        object GetDetails();

        bool IsAlive();
    }
}

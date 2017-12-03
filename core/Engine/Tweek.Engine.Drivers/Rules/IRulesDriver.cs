using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Tweek.Engine.Drivers.Rules
{
    public interface IRulesDriver
    {
        Task<string> GetVersion(CancellationToken cancellationToken = default(CancellationToken));

        Task<Dictionary<string, RuleDefinition>> GetRuleset(string version,
            CancellationToken cancellationToken = default(CancellationToken));
    }
}

using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace Engine.Drivers.Rules
{
    public interface IRulesDriver
    {
        IObservable<string> OnVersion();

        Task<Dictionary<string, RuleDefinition>> GetRuleset(string version,
            CancellationToken cancellationToken = default(CancellationToken));
    }
}

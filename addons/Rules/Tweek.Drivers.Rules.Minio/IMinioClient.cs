using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Engine.Drivers.Rules;

namespace Tweek.Drivers.Rules.Minio
{
    public interface IMinioClient
    {
        Task<string> GetVersion(CancellationToken cancellationToken = default(CancellationToken));

        Task<Dictionary<string, RuleDefinition>> GetRuleset(string version,
            CancellationToken cancellationToken = default(CancellationToken));
    }
}
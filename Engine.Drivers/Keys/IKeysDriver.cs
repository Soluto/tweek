using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Engine.Drivers.Keys
{
    public interface IKeysDriver
    {
        event Action OnPathChanges;
        Task<List<string>> GetPaths();
    }
}

using System.Collections.Generic;
using System.Threading.Tasks;
using Engine.Core.DataTypes;

namespace Engine.Drivers.Context
{
    public interface IContextDriver
    {
        Task<Dictionary<string,string>> GetContext(Identity identity);
    }
}

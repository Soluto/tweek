using FSharpUtils.Newtonsoft;
using System.Collections.Generic;
using System.Threading.Tasks;
using Tweek.Engine.DataTypes;

namespace Engine.Drivers.Context
{
    public interface IContextReader
    {
        Task<Dictionary<string, JsonValue>> GetContext(Identity identity);
    }
}

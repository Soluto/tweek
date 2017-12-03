using FSharpUtils.Newtonsoft;
using System.Collections.Generic;
using System.Threading.Tasks;
using Tweek.Engine.DataTypes;

namespace Tweek.Engine.Drivers.Context
{
    public interface IContextWriter
    {
        Task AppendContext(Identity identity, Dictionary<string, JsonValue> context);
        Task RemoveFromContext(Identity identity, string key);
    }
}

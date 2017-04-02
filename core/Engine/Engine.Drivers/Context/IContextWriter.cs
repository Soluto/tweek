using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.DataTypes;
using FSharpUtils.Newtonsoft;

namespace Engine.Drivers.Context
{
    public interface IContextWriter
    {
        Task AppendContext(Identity identity, Dictionary<string, JsonValue> context);
        Task RemoveFromContext(Identity identity, string key);
    }
}

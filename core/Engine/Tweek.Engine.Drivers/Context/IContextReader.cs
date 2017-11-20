using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.DataTypes;
using FSharpUtils.Newtonsoft;

namespace Engine.Drivers.Context
{
    public interface IContextReader
    {
        Task<Dictionary<string, JsonValue>> GetContext(Identity identity);
    }
}

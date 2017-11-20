using System.Collections.Generic;
using System.Threading.Tasks;
using Engine.DataTypes;

namespace Engine.Drivers.Context
{
    public interface IContextDriver : IContextReader, IContextWriter
    {
    }
}

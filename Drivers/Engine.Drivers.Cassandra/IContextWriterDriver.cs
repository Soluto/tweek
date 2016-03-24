using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.DataTypes;

namespace Engine.Drivers.Cassandra
{
    interface IContextWriterDriver
    {
        Task WriteValue(Identity identity, string key, string value);
    }
}

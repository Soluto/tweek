using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Engine.Drivers.Context
{
    interface IContextDriver
    {
        Task<Dictionary<string,string>> GetContext(Identity identity);
    }
}

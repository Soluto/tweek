using FSharpUtils.Newtonsoft;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Tweek.ApiService.Addons;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.Context.Multi
{
    public class MultiDriver : IContextDriver
    {
        // Need to think about it...
        public MultiDriver(string connectionString)
        {
            if ((connectionString ?? "") == "")
            {
                throw new ArgumentException("Missing redis connection string", nameof(connectionString));
            }

        }

        public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
          throw new NotImplementedException();
        }

        public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
        {
          throw new NotImplementedException();
        }

        public async Task RemoveFromContext(Identity identity, string key)
        {
          throw new NotImplementedException();
        }
    }
}

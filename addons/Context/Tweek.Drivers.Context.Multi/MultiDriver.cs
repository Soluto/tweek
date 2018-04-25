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
        private IEnumerable<IContextDriver> _readers;
        private IEnumerable<IContextDriver> _writers;
        // Need to think about it...
        public MultiDriver(IEnumerable<IContextDriver> readers, IEnumerable<IContextDriver> writers)
        {
            if (readers == null || !readers.Any())
            {
                throw new ArgumentException("Missing readers", nameof(readers));
            }

            if (writers == null || !writers.Any())
            {
                throw new ArgumentException("Missing writers", nameof(writers));
            }

            _readers = readers;
            _writers = writers;
        }

        public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
          throw new NotImplementedException();
        }

        public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
        {
            Exception lastException = null;
            foreach (var contextDriver in _readers)
            {
                try
                {
                    return await contextDriver.GetContext(identity);
                }
                catch (Exception e)
                {
                    lastException = e;
                }
            }

            throw lastException;
        }

        public async Task RemoveFromContext(Identity identity, string key)
        {
          throw new NotImplementedException();
        }
    }
}

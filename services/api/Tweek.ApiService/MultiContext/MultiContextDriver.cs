using FSharpUtils.Newtonsoft;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;

namespace Tweek.ApiService.MultiContext
{
    public class MultiContextDriver : IContextDriver
    {
        private readonly IEnumerable<IContextDriver> _readers;
        private readonly IEnumerable<IContextDriver> _writers;

        public MultiContextDriver(IEnumerable<IContextDriver> readers, IEnumerable<IContextDriver> writers)
        {
            var readersArray = readers?.ToArray() ?? new IContextDriver[]{};
            var writersArray = writers?.ToArray() ?? new IContextDriver[]{};

            if (!readersArray.Any())
            {
                throw new ArgumentException("Missing readers", nameof(readers));
            }

            if (!writersArray.Any())
            {
                throw new ArgumentException("Missing writers", nameof(writers));
            }

            _readers = readersArray;
            _writers = writersArray;
        }

        public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            await Task.WhenAll(_writers.Select(contextDriver => contextDriver.AppendContext(identity, context)));
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
            await Task.WhenAll(_writers.Select(contextDriver => contextDriver.RemoveFromContext(identity, key)));
        }
    }
}

using Couchbase.Core;
using Couchbase.IO;
using FSharpUtils.Newtonsoft;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Couchbase;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using System.Collections.Concurrent;

namespace Tweek.ApiService.SA
{
    public class InMemoryContextDriver : IContextDriver
    {
        private ConcurrentDictionary<string, Dictionary<string, JsonValue>> _data;

        private static string GetKey(Identity id) => $"identity_{id.Type}_{id.Id}";
        
        public InMemoryContextDriver()
        {
            _data = new ConcurrentDictionary<string, Dictionary<string,JsonValue>>();
        }

        public Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
        {
            return Task.FromResult(_data[GetKey(identity)]);
        }

        public Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            Dictionary<string, JsonValue> item;
            if (!_data.TryGetValue(GetKey(identity), out item))
            {
                var dataWithDate = new Dictionary<string,JsonValue>(context);
                dataWithDate.Add("@CreationDate", JsonValue.NewString(DateTimeOffset.UtcNow.ToString()));
                _data[GetKey(identity)] = dataWithDate;
                return Task.CompletedTask;
            }
                
            _data[GetKey(identity)] = Merge(item, context);
            return Task.CompletedTask;
        }

        public Task RemoveFromContext(Identity identity, string key)
        {
            _data[GetKey(identity)].Remove(key);
            return Task.CompletedTask;
        }

        public Task DeleteContext(Identity identity)
        {
            _data.Remove(GetKey(identity), out _);
            return Task.CompletedTask;
        }

        private static Dictionary<string, JsonValue> Merge(Dictionary<string, JsonValue> item, Dictionary<string, JsonValue> context)
        {
            var result = new Dictionary<string,JsonValue>();
            var keys = context.Keys.Concat(item.Keys);
            foreach (var key in keys)
            {
                if (context.TryGetValue(key, out var value))
                {
                    result.Add(key,value);
                }
                else
                {
                    result.Add(key, item[key]);
                }
            }
            return result;
        }
    }
}

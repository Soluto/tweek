using System.Collections.Concurrent;
using FSharpUtils.Newtonsoft;
using System.Collections.Generic;
using System.Linq;
using System;
using System.Threading.Tasks;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.Context.InMemory
{
    public class InMemoryContext : IContextDriver
    {
        private ConcurrentDictionary<string, Dictionary<string, JsonValue>> _data;

        public InMemoryContext()
        {
            _data = new ConcurrentDictionary<string, Dictionary<string, JsonValue>>();
        }

        private static string GetKey(Identity identity) => $"identity_{identity.Type}_{identity.Id}";

        public Task RemoveFromContext(Identity identity, string key)
        {
            if (_data.TryGetValue(GetKey(identity), out var context)) context.Remove(key);
            return Task.CompletedTask;
        }

        public Task DeleteContext(Identity identity)
        {
            _data.Remove(GetKey(identity), out _);
            return Task.CompletedTask;
        }

        public Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            var key = GetKey(identity);

            _data.AddOrUpdate(
                key,
                key => {
                    var contextWithDate = new Dictionary<string, JsonValue>(context);
                    contextWithDate.Add("@CreationDate", JsonValue.NewString(DateTimeOffset.UtcNow.ToString()));
                    return contextWithDate;
                },
                (key, existingContext) => MergeContexts(existingContext, context)
            );

            return Task.CompletedTask;
        }

        public Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
        {
            if (_data.TryGetValue(GetKey(identity), out var context)) return Task.FromResult(context);
            return Task.FromResult(new Dictionary<string, JsonValue>());
        }

        private static Dictionary<string, JsonValue> MergeContexts(Dictionary<string, JsonValue> existingContext, Dictionary<string, JsonValue> context)
        {
            var keys = context.Keys.Concat(existingContext.Keys).Distinct();

            return keys.ToDictionary(
                key => key,
                key => context.TryGetValue(key, out var value) ? value : existingContext[key]
            );
        }
    }
}

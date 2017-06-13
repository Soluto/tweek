using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading.Tasks;
using Engine.DataTypes;
using Engine.Drivers.Context;
using FSharpUtils.Newtonsoft;
using StackExchange.Redis;
using Newtonsoft.Json.Linq;
using System.Net;
using LanguageExt;
using Newtonsoft.Json;
using Tweek.ApiService.Addons;

namespace Tweek.Drivers.Redis
{
    public class RedisDriver : IContextDriver
    {
        private readonly ConnectionMultiplexer mRedisConnection;

        public string GetKey(Identity identity) => "identity_" + identity.Type + "_" + identity.Id;

        public RedisDriver(string connectionString)
        {
            // FIXME: use the values from configuration
            // var options = ConfigurationOptions.Parse(connectionString);
            var endpointIP = Dns.GetHostAddressesAsync("tweek-redis").Result
                .Select(x => x.MapToIPv4().ToString())
                .First();
            mRedisConnection = ConnectionMultiplexer.Connect(endpointIP);
        }

        public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            var db = mRedisConnection.GetDatabase();
            var id = GetKey(identity);
            HashEntry[] redisContext = context.Select(item =>
                new HashEntry(item.Key, JsonConvert.SerializeObject(item.Value, new JsonSerializerSettings{ContractResolver = new TweekContractResolver()}))
            ).ToArray();

            await db.HashSetAsync(id, redisContext);
        }

        public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
        {
            var db = mRedisConnection.GetDatabase();
            var id = GetKey(identity);
            var redisResult = await db.HashGetAllAsync(id);
            var result = new Dictionary<string, JsonValue>(redisResult.Length);

            foreach (var item in redisResult)
            {
                result.Add(item.Name, JsonValue.Parse(item.Value));
            }

            return result;
        }

        public async Task RemoveFromContext(Identity identity, string key)
        {
            var db = mRedisConnection.GetDatabase();
            var id = GetKey(identity);
            await db.HashDeleteAsync(id, key);
        }
    }
}
using FSharpUtils.Newtonsoft;
using Newtonsoft.Json;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Tweek.ApiService.Addons;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.Redis
{
    public class RedisDriver : IContextDriver
    {
        private readonly ConnectionMultiplexer mRedisConnection;
        private JsonSerializerSettings JSON_SERIALIZER_SETTINGS = new JsonSerializerSettings { ContractResolver = new TweekContractResolver() };
        public string GetKey(Identity identity) => "identity_" + identity.Type + "_" + identity.Id;

        public RedisDriver(string connectionString)
        {
            if ((connectionString ?? "") == "")
            {
                throw new ArgumentException("Missing redis connection string", nameof(connectionString));
            }

            var options = TranslateDnsToIP(ConfigurationOptions.Parse(connectionString));
            mRedisConnection = ConnectionMultiplexer.Connect(options);
        }

        private ConfigurationOptions TranslateDnsToIP(ConfigurationOptions configurationOptions)
        {
            var dnsEndpoints = configurationOptions.EndPoints
                .OfType<DnsEndPoint>()
                .SelectMany(endpoint =>
                    Dns.GetHostAddressesAsync(endpoint.Host).Result
                        .Select(ip => new IPEndPoint(ip, endpoint.Port))
                );
            var ipEndpoints = configurationOptions.EndPoints.OfType<IPEndPoint>();
            var endpoints = dnsEndpoints.Concat(ipEndpoints);
            var result = configurationOptions.Clone();
            result.EndPoints.Clear();
            foreach (var endpoint in endpoints)
            {
                result.EndPoints.Add(endpoint);
            }
            return result;
        }

        public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            var db = mRedisConnection.GetDatabase();
            var id = GetKey(identity);
            var contextWithCreationDate = new Dictionary<string, JsonValue>(context)
            {
                ["@CreationDate"] = JsonValue.NewString(DateTimeOffset.UtcNow.ToString())
            };
            HashEntry[] redisContext = contextWithCreationDate.Select(item =>
                new HashEntry(item.Key, JsonConvert.SerializeObject(item.Value, JSON_SERIALIZER_SETTINGS))
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
                var value = JsonValue.Parse(item.Value);
                if (value.IsFloat)
                {
                    value = JsonValue.NewNumber(value.AsDecimal());
                }
                result.Add(item.Name, value);
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
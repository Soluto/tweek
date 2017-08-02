using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Engine.DataTypes;
using Engine.Drivers.Context;
using FSharpUtils.Newtonsoft;
using Tweek.Drivers.Redis;
using StackExchange.Redis;

namespace ContextDriversIntegrationTests
{
    public class TestableRedisContext: ITestableContextDriver
    {
        private static string RedisConnectionString => Environment.GetEnvironmentVariable("REDIS_TEST_CONNECTION");

        private readonly IContextDriver mTestableContextDriverImplementation = new RedisDriver(RedisConnectionString);

        public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
            => await mTestableContextDriverImplementation.GetContext(identity);


        public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
            => await mTestableContextDriverImplementation.AppendContext(identity, context);

        public async Task RemoveFromContext(Identity identity, string key)
            => await mTestableContextDriverImplementation.RemoveFromContext(identity, key);

        public async Task ClearAllData()
        {
            var options = ConfigurationOptions.Parse(RedisConnectionString);
            options.AllowAdmin = true;
            var connection = ConnectionMultiplexer.Connect(options);
            foreach (var endPoint in connection.GetEndPoints(true))
            {
                await connection.GetServer(endPoint).FlushAllDatabasesAsync();
            }
            await connection.CloseAsync();
        }
    }
}
using System;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.Context.Redis.IntegrationTests
{
    public class RedisIntegrationTests: ContextIntegrationTests.IntegrationTests
    {
        public RedisIntegrationTests()
        {
            Driver = new RedisDriver(Environment.GetEnvironmentVariable("REDIS_TEST_CONNECTION"));
        }

        protected sealed override IContextDriver Driver { get; set; }
    }
}

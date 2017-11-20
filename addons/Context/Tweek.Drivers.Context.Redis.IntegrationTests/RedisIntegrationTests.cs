using ContextDriversIntegrationTests;
using System;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.Redis.ContextIntegrationTests
{
    public class RedisIntegrationTests: IntegrationTests
    {
        public RedisIntegrationTests()
        {
            Driver = new RedisDriver(Environment.GetEnvironmentVariable("REDIS_TEST_CONNECTION"));
        }

        protected sealed override IContextDriver Driver { get; set; }
    }
}

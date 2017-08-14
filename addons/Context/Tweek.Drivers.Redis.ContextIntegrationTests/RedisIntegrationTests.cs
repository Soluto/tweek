using System;
using ContextDriversIntegrationTests;
using Engine.Drivers.Context;
using Xunit;

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

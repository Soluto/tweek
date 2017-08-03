using System;
using ContextDriversIntegrationTests;
using Xunit;

namespace Tweek.Drivers.Redis.ContextIntegrationTests
{
    public class RedisIntegrationTests: IntegrationTests
    {
        public RedisIntegrationTests()
        {
            Driver = new TestableRedisContext();
        }
    }
}

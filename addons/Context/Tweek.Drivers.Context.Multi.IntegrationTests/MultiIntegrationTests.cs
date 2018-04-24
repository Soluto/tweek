using System;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.Context.Multi.IntegrationTests
{
    public class MultiIntegrationTests: ContextIntegrationTests.IntegrationTests
    {
        public MultiIntegrationTests()
        {
            Driver = new MultiDriver(Environment.GetEnvironmentVariable("REDIS_TEST_CONNECTION"));
        }

        protected sealed override IContextDriver Driver { get; set; }
    }
}

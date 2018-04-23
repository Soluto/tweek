using System;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.Context.MongoDb.IntegrationTests
{
    public class MongoDbIntegrationTests: ContextIntegrationTests.IntegrationTests
    {
        public MongoDbIntegrationTests()
        {
            Driver = new MongoDbDriver(Environment.GetEnvironmentVariable("MONGODB_TEST_CONNECTION"));
        }

        protected sealed override IContextDriver Driver { get; set; }
    }
}

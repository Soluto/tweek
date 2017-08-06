using System;
using ContextDriversIntegrationTests;
using Couchbase;
using Tweek.Drivers.CouchbaseDriver;
using Xunit;

namespace Tweek.Drivers.Couchbase.ContextIntegrationTests
{
    public class CouchbaseIntegrationTests: IntegrationTests
    {
        public CouchbaseIntegrationTests()
        {
            Driver = new CouchBaseDriver(ClusterHelper.GetBucket, Environment.GetEnvironmentVariable("COUCHBASE_TEST_BUCKET"));
        }
    }
}

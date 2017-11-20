using ContextDriversIntegrationTests;
using Couchbase;
using Couchbase.Configuration.Client;
using Couchbase.Core.Serialization;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using Tweek.ApiService.Addons;
using Tweek.Drivers.CouchbaseDriver;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.Couchbase.ContextIntegrationTests
{
    public class CouchbaseIntegrationTests: IntegrationTests
    {
        public CouchbaseIntegrationTests()
        {
            var url = Environment.GetEnvironmentVariable("COUCHBASE_TEST_URL");
            const string bucketName = "testbucket";
            const string bucketPassword = "password";

            if (!ClusterHelper.Initialized)
            {
                ClusterHelper.Initialize(new ClientConfiguration
                {
                    Servers = new List<Uri> { new Uri(url) },
                    BucketConfigs = new Dictionary<string, BucketConfiguration>
                    {
                        [bucketName] = new BucketConfiguration
                        {
                            BucketName = bucketName,
                            Password = bucketPassword,
                            PoolConfiguration = new PoolConfiguration()
                            {
                                MaxSize = 30,
                                MinSize = 5
                            }
                        },
                    },
                    Serializer = () => new DefaultSerializer(
                        new JsonSerializerSettings()
                        {
                            ContractResolver = new TweekContractResolver()
                        },
                        new JsonSerializerSettings()
                        {
                            ContractResolver = new TweekContractResolver()
                        })
                });
            }

            Driver = new CouchBaseDriver(ClusterHelper.GetBucket, bucketName);
        }

        protected sealed override IContextDriver Driver { get; set; }
    }
}

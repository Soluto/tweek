using System;
using System.Collections.Generic;
using Couchbase;
using Couchbase.Configuration.Client;
using Couchbase.Core.Serialization;
using Newtonsoft.Json;
using Tweek.ApiService.Addons;
using Tweek.Drivers.Context.Couchbase;
using Tweek.Drivers.Context.Redis;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.Context.Multi.IntegrationTests
{
    public class MultiIntegrationTests: ContextIntegrationTests.IntegrationTests
    {
        public MultiIntegrationTests()
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

            Driver = new MultiDriver(
                new IContextDriver[]
                {
                    new RedisDriver(Environment.GetEnvironmentVariable("REDIS_TEST_CONNECTION")),
                    new CouchBaseDriver(ClusterHelper.GetBucket, bucketName),
                },
                new IContextDriver[]
                {
                    new RedisDriver(Environment.GetEnvironmentVariable("REDIS_TEST_CONNECTION")),
                    new CouchBaseDriver(ClusterHelper.GetBucket, bucketName),
                }
            );
        }

        protected sealed override IContextDriver Driver { get; set; }
    }
}

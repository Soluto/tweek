using System;
using System.Collections.Generic;
using Couchbase;
using Couchbase.Configuration.Client;
using Couchbase.Core.Serialization;
using Engine.Drivers.Context;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;
using Tweek.ApiService.Addons;
using Tweek.Drivers.Couchbase;

namespace Tweek.Drivers.CouchbaseDriver
{
    public class CouchBaseServiceAddon: ITweekAddon
    {
        public void Use(IApplicationBuilder builder, IConfiguration configuration)
        {
        }

        public void Configure(IServiceCollection services, IConfiguration configuration)
        {
            var couchbaseConfig = configuration.GetSection("Couchbase");
            var contextBucketName = couchbaseConfig["BucketName"];
            var contextBucketPassword = couchbaseConfig["Password"];
            var url = couchbaseConfig["Url"];

            InitCouchbaseCluster(contextBucketName, contextBucketPassword, url);

            var contextDriver = new CouchBaseDriver(ClusterHelper.GetBucket, contextBucketName);
            var couchbaseDiagnosticsProvider = new BucketConnectionIsAlive(ClusterHelper.GetBucket, contextBucketName);

            services.AddSingleton<IContextDriver>(contextDriver);
            services.AddSingleton<IDiagnosticsProvider>(couchbaseDiagnosticsProvider);
        }

        private void InitCouchbaseCluster(string bucketName, string bucketPassword, string url)
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
                    }
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

    }
}
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Cassandra;
using Engine;
using Engine.Context;
using Engine.Drivers.Cassandra;
using Engine.Drivers.Context;
using Engine.Drivers.Rules;
using Engine.Drivers.Rules.Git;
using Engine.Match.DSL;
using Nancy;
using Nancy.Bootstrapper;
using Nancy.TinyIoc;
using Tweek.JPad;
using Tweek.Drivers.CouchbaseDriver;
using Couchbase.Configuration.Client;
using Couchbase;
using Newtonsoft.Json;

namespace Tweek.ApiService
{

    public class Bootstrapper : DefaultNancyBootstrapper
    {

        public Tuple<IContextDriver, IRulesDriver> GetDrivers()
        {
            var driver = GetCouchbaseDriver();
            return new Tuple<IContextDriver, IRulesDriver>(driver, new GitDriver(
                Path.Combine(System.Web.HttpRuntime.AppDomainAppPath, "tweek-rules" + Guid.NewGuid()),
                new RemoteRepoSettings()
                {
                    url = "http://tweek-gogs.07965c2a.svc.dockerapp.io/tweek/tweek-rules",
                    Email = "tweek@soluto.com",
                    UserName = "tweek",
                    Password = "***REMOVED***"
                }));
        } 

        private CassandraDriver GetCassandraDriver()
        {
            var cluster = Cassandra.Cluster.Builder()
                .WithQueryOptions(new QueryOptions().SetConsistencyLevel(ConsistencyLevel.All))
                .AddContactPoints("dc0vm1tqwdso6zqj26c.eastus.cloudapp.azure.com",
                    "dc0vm0tqwdso6zqj26c.eastus.cloudapp.azure.com")
                .Build();

            var session = cluster.Connect("tweek");
            return new CassandraDriver(session);
        }

        CouchBaseDriver GetCouchbaseDriver()
        {
            var bucketName = "tweek-context";
            var cluster = new Couchbase.Cluster(new ClientConfiguration
            {
                Servers = new List<Uri> { new Uri("http://tweek-db-couchbase.023209ac.svc.dockerapp.io:8091/") },
                BucketConfigs = new Dictionary<string, BucketConfiguration>
                {
                    [bucketName] = new BucketConfiguration
                    {
                        BucketName = bucketName,
                        Password = "***REMOVED***",
                        UseEnhancedDurability = true
                    }
                    
                },
                Serializer = () => new Couchbase.Core.Serialization.DefaultSerializer(
                   
                   new JsonSerializerSettings()
                   {
                       ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver()
                   },
                   new JsonSerializerSettings()
                   {
                       ContractResolver = new Newtonsoft.Json.Serialization.DefaultContractResolver()
                   })
            });
            return new CouchBaseDriver(cluster, bucketName);
        }

        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            var drivers = GetDrivers();
            ITweek tweek = Task.Run(async()=> await Engine.Tweek.Create(drivers.Item1,
                                           drivers.Item2, new JPadParser(
                                           comparers: new Dictionary<string,MatchDSL.ComparerDelegate>() {
                                               ["version"] = Version.Parse
                                           }))).Result;

            container.Register<ITweek>((ctx, no) => tweek);
            container.Register<IContextDriver>((ctx, no) => drivers.Item1);
            base.ApplicationStartup(container, pipelines);
        }
    }
}
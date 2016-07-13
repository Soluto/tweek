using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Reactive.Threading.Tasks;
using System.Threading.Tasks;
using System.Web;
using Cassandra;
using Engine;
using Engine.Context;
using Engine.Core.Rules;
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
using Tweek.Drivers.Blob;

namespace Tweek.ApiService
{

    public class Bootstrapper : DefaultNancyBootstrapper
    {
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
                Servers = new List<Uri> { new Uri("http://tweek-db-east-1.17d25bc0.cont.dockerapp.io:8091/") },
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

        IRuleParser GetRulesParser()
        {
            return new JPadParser(
                comparers: new Dictionary<string, MatchDSL.ComparerDelegate>()
                {
                    ["version"] = Version.Parse
                });
        }

        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            //InitLogging();

            var contextDriver = GetCouchbaseDriver();
            //var rulesDriver = new BlobRulesDriver("http://localhost:3000/ruleset/latest");
            var rulesDriver = new BlobRulesDriver("https://tweek-management.azurewebsites.net/ruleset/latest");

            var parser = GetRulesParser();
            var subject = new BehaviorSubject<ITweek>(CreateEngine(contextDriver, rulesDriver, parser).Result);

            container.Register<ITweek>((ctx, no) => subject.FirstAsync().Wait());
            container.Register<IContextDriver>((ctx, no) => contextDriver);
            container.Register<IRuleParser>((ctx, no) => parser);

            Observable.Interval(TimeSpan.FromSeconds(60 * 60))
                .SelectMany(_ => CreateEngine(contextDriver, rulesDriver, parser))
                .Catch((Exception exception) =>
                {
                    //Log.Error("Failed to create engine with updated ruleset", exception, new Dictionary<string, object> { { "RoleName", "TweekApi" } });
                    return Observable.Empty<ITweek>();
                })
                .Repeat()
                .Subscribe(subject);

            base.ApplicationStartup(container, pipelines);
        }

        /*
        private static void InitLogging()
        {
            var configSource = new CompositeConfiguration(new LocalConfigFile());
            var result = configSource.Retrieve<string>("RaygunClientId").Result;
            var nLogLogger = new NLogLogger();
            if (!string.IsNullOrEmpty(result))
            {
                nLogLogger = nLogLogger.WithRaygun(result);
            }
            Log.Init(nLogLogger);
        }*/

        private static Task<ITweek> CreateEngine(CouchBaseDriver contextDriver, BlobRulesDriver rulesDriver, IRuleParser parser)
        {
            return Engine.Tweek.Create(contextDriver, rulesDriver, parser);
        }
    }
}
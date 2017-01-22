using System;
using System.Collections.Generic;
using System.Configuration;
using System.Threading.Tasks;
using Couchbase;
using Couchbase.Configuration.Client;
using Couchbase.Core.Serialization;
using Engine;
using Engine.Core.Rules;
using Engine.Drivers.Context;
using Engine.Drivers.Rules;
using FSharp.Data;
using Nancy;
using Nancy.Bootstrapper;
using Nancy.TinyIoc;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Newtonsoft.Json.Serialization;
using NLog;
using NLog.Config;
using NLog.Targets;
using Tweek.ApiService.Interfaces;
using Tweek.ApiService.Modules;
using Tweek.ApiService.Services;
using Tweek.ApiService.Utils;
using Tweek.Drivers.Blob;
using Tweek.Drivers.CouchbaseDriver;
using Tweek.JPad;
using Tweek.JPad.Utils;
using Tweek.Drivers.Blob.WebClient;
using Tweek.Utils;

namespace Tweek.ApiService
{
    class TweekContractResolver : DefaultContractResolver
    {
        protected override JsonContract CreateContract(Type objectType)
         {
            JsonContract contract = base.CreateContract(objectType);
 
            if (typeof(JsonValue).IsAssignableFrom(objectType))
            {
                contract.Converter = new JsonValueConverter();
            }

            return contract;
        }
    }
    public class Bootstrapper : DefaultNancyBootstrapper
    {
        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            InitLogging();
            
            var contextBucketName = ConfigurationManager.AppSettings["Couchbase.BucketName"];
            var contextBucketPassword = ConfigurationManager.AppSettings["Couchbase.Password"];

            InitCouchbaseCluster(contextBucketName, contextBucketPassword);
            var contextDriver = new CouchBaseDriver(ClusterHelper.GetBucket, contextBucketName);

            var rulesDriver = GetRulesDriver();
            StaticConfiguration.DisableErrorTraces = false;

            var parser = GetRulesParser();

            var tweek = Task.Run(async () => await Engine.Tweek.Create(contextDriver, rulesDriver, parser)).Result;

            var bucketConnectionIsAlive = new BucketConnectionIsAlive(ClusterHelper.GetBucket, contextBucketName);
            var rulesDriverStatusService = new RulesDriverStatusService(rulesDriver);

            container.Register<ITweek>(tweek);
            container.Register<IContextDriver>(contextDriver);
            container.Register<IRuleParser>(parser);
            container.Register<IEnumerable<IDiagnosticsProvider>>((ctx, no) => new List<IDiagnosticsProvider> {  bucketConnectionIsAlive, rulesDriverStatusService});

            var jsonSerializer = new JsonSerializer() {ContractResolver = new TweekContractResolver()};
            container.Register<JsonSerializer>(jsonSerializer);
                
            base.ApplicationStartup(container, pipelines);
        }

        IRuleParser GetRulesParser()
        {
            return JPadRulesParserAdapter.Convert(new JPadParser(new ParserSettings(
                comparers: new Dictionary<string, ComparerDelegate>()
                {
                    ["version"] = Version.Parse
                })));
        }

        private void InitCouchbaseCluster(string bucketName, string bucketPassword)
        {
            var url = ConfigurationManager.AppSettings["Couchbase.Url"];

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

        private BlobRulesDriver GetRulesDriver()
        {
            return new BlobRulesDriver(new Uri(ConfigurationManager.AppSettings["RulesBlob.Url"]), new SystemWebClientFactory());
        }

        private static void InitLogging()
        {
            var configuration = new LoggingConfiguration();

            var fileTarget = new FileTarget
            {
                FileName = "${basedir}/tweek-" + DateTime.UtcNow.ToString("yyyyMMdd") + ".log",
                Layout = @"${date:format=HH\:mm\:ss} | ${message}"
            };

            configuration.AddTarget("file", fileTarget);

            var rule = new LoggingRule("*", LogLevel.Debug, fileTarget);
            configuration.LoggingRules.Add(rule);

            LogManager.Configuration = configuration;
        }
    }
}
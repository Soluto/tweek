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
using Nancy;
using Nancy.Bootstrapper;
using Nancy.TinyIoc;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using NLog;
using NLog.Config;
using NLog.Targets;
using Tweek.ApiService.Interfaces;
using Tweek.ApiService.Services;
using Tweek.Drivers.Blob;
using Tweek.Drivers.CouchbaseDriver;
using Tweek.JPad;
using Tweek.JPad.Utils;
using Tweek.Drivers.Blob.WebClient;

namespace Tweek.ApiService
{
    public class Bootstrapper : DefaultNancyBootstrapper
    {
        IRuleParser GetRulesParser()
        {
            return JPadRulesParserAdapter.Convert(new JPadParser(new ParserSettings(
                comparers: new Dictionary<string, ComparerDelegate>()
                {
                    ["version"] = Version.Parse
                })));
        }

        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            InitLogging();
            
            var contextBucketName = ConfigurationManager.AppSettings["Couchbase.BucketName"];
            var contextBucketPassword = ConfigurationManager.AppSettings["Couchbase.Password"];

            var cluster = GetCouchbaseCluster(contextBucketName, contextBucketPassword);
            var contextDriver = new CouchBaseDriver(cluster, contextBucketName);

            var rulesDriver = GetRulesDriver();
            StaticConfiguration.DisableErrorTraces = false;

            var parser = GetRulesParser();

            var tweek = Task.Run(async () => await Engine.Tweek.Create(contextDriver, rulesDriver, parser)).Result;

            var isAliveService = new BucketConnectionIsAlive(cluster, contextBucketName);

            container.Register<ITweek>((ctx, no) => tweek);
            container.Register<IContextDriver>((ctx, no) => contextDriver);
            container.Register<IRuleParser>((ctx, no) => parser);
            container.Register<IIsAliveService>((ctx, no) => isAliveService);
            base.ApplicationStartup(container, pipelines);
        }

        private Cluster GetCouchbaseCluster(string bucketName, string bucketPassword)
        {
            var url = ConfigurationManager.AppSettings["Couchbase.Url"];

            var cluster = new Couchbase.Cluster(new ClientConfiguration
            {
                Servers = new List<Uri> { new Uri(url) },
                BucketConfigs = new Dictionary<string, BucketConfiguration>
                {
                    [bucketName] = new BucketConfiguration
                    {
                        BucketName = bucketName,
                        Password = bucketPassword,
                    }
                },
                Serializer = () => new DefaultSerializer(
                   new JsonSerializerSettings()
                   {
                       ContractResolver = new DefaultContractResolver()
                   },
                   new JsonSerializerSettings()
                   {
                       ContractResolver = new DefaultContractResolver()
                   })
            });

            return cluster;
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
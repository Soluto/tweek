using System;
using System.Collections.Generic;
using System.Configuration;
using System.Net;
using System.Threading.Tasks;
using Couchbase.Configuration.Client;
using Couchbase.Core.Serialization;
using Engine;
using Engine.Core.Rules;
using Engine.Drivers.Context;
using Nancy;
using Nancy.Bootstrapper;
using Nancy.TinyIoc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using NLog;
using NLog.Config;
using NLog.Targets;
using Tweek.Drivers.Blob;
using Tweek.Drivers.CouchbaseDriver;
using Tweek.JPad;
using Tweek.JPad.Utils;

namespace Tweek.ApiService
{

    public class Bootstrapper : DefaultNancyBootstrapper
    {
        private dynamic _settings;

        private CouchBaseDriver GetCouchbaseDriver()
        {
            var bucketName = _settings.couchbase.bucketName.ToString();
            var password = _settings.couchbase.password.ToString();
            var url = _settings.couchbase.url.ToString();

            var cluster = new Couchbase.Cluster(new ClientConfiguration
            {
                Servers = new List<Uri> { new Uri(url) },
                BucketConfigs = new Dictionary<string, BucketConfiguration>
                {
                    [bucketName] = new BucketConfiguration
                    {
                        BucketName = bucketName,
                        Password = password,
                        UseEnhancedDurability = true
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
            return new CouchBaseDriver(cluster, bucketName);
        }

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

            _settings = GetSettings().Result;

            var contextDriver = GetCouchbaseDriver();
            var rulesDriver = GetRulesDriver();
            StaticConfiguration.DisableErrorTraces = false;

            var parser = GetRulesParser();

            var tweek = Task.Run(async () => await Engine.Tweek.Create(contextDriver, rulesDriver, parser)).Result;

            container.Register<ITweek>((ctx, no) => tweek);
            container.Register<IContextDriver>((ctx, no) => contextDriver);
            container.Register<IRuleParser>((ctx, no) => parser);

            base.ApplicationStartup(container, pipelines);
        }

        private static async Task<JObject> GetSettings()
        {
            var managementBaseUrl = new Uri(ConfigurationManager.AppSettings["Tweek.Management.BaseUrl"]);
            var managementUrl = new Uri(managementBaseUrl, "settings");

            using (var client = new WebClient())
            {
                var json = await client.DownloadStringTaskAsync(managementUrl);
                return JsonConvert.DeserializeObject<dynamic>(json);
            }
        }

        private BlobRulesDriver GetRulesDriver()
        {
            return new BlobRulesDriver(new Uri(_settings.rulesBlobUrl.ToString()));
        }

        private static void InitLogging()
        {
            var configuration = new LoggingConfiguration();

            var fileTarget = new FileTarget
            {
                FileName = "${basedir}/tweek-"+ DateTime.UtcNow.ToString("yyyyMMdd") + ".log",
                Layout = @"${date:format=HH\:mm\:ss} | ${message}"
            };

            configuration.AddTarget("file", fileTarget);

            var rule = new LoggingRule("*", LogLevel.Debug, fileTarget);
            configuration.LoggingRules.Add(rule);

            LogManager.Configuration = configuration;
        }

        private static Task<ITweek> CreateEngine(CouchBaseDriver contextDriver, BlobRulesDriver rulesDriver, IRuleParser parser)
        {
            return Engine.Tweek.Create(contextDriver, rulesDriver, parser);
        }
    }
}
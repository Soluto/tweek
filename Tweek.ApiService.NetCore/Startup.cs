using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Couchbase;
using Couchbase.Configuration.Client;
using Tweek.Drivers.Blob;
using Tweek.Drivers.Blob.WebClient;
using Newtonsoft.Json;
using Couchbase.Core.Serialization;
using Engine;
using Newtonsoft.Json.Serialization;
using FSharp.Data;
using Tweek.Utils;
using Tweek.Drivers.CouchbaseDriver;
using Engine.Core.Rules;
using Engine.Drivers.Context;
using Tweek.JPad.Utils;
using Tweek.JPad;
using Tweek.ApiService.NetCore.Diagnostics;

namespace Tweek.ApiService.NetCore
{
    class TweekContractResolver : DefaultContractResolver
    {
        protected override JsonContract CreateContract(Type objectType)
        {
            var contract = base.CreateContract(objectType);

            if (typeof(JsonValue).IsAssignableFrom(objectType))
            {
                contract.Converter = new JsonValueConverter();
            }

            return contract;
        }
    }

    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();

            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddApplicationInsightsTelemetry(Configuration);

            var contextBucketName = Configuration["Couchbase.BucketName"];
            var contextBucketPassword = Configuration["Couchbase.Password"];

            InitCouchbaseCluster(contextBucketName, contextBucketPassword);
            var contextDriver = new CouchBaseDriver(ClusterHelper.GetBucket, contextBucketName);
            var couchbaseDiagnosticsProvider = new BucketConnectionIsAlive(ClusterHelper.GetBucket, contextBucketName);

            var rulesDriver = GetRulesDriver();
            var rulesDiagnostics = new RulesDriverStatusService(rulesDriver);

            var parser = GetRulesParser();
            var tweek = Task.Run(async () => await Engine.Tweek.Create(contextDriver, rulesDriver, parser)).Result;

            services.AddSingleton(tweek);
            services.AddSingleton<IContextDriver>(contextDriver);
            services.AddSingleton(parser);
            services.AddSingleton<IEnumerable<IDiagnosticsProvider>>(new IDiagnosticsProvider[] {rulesDiagnostics, couchbaseDiagnosticsProvider});

            services.AddMvc().AddJsonOptions(opt =>
            {
                opt.SerializerSettings.ContractResolver = new TweekContractResolver();
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            if (env.IsDevelopment())
            { 
                loggerFactory.AddConsole(Configuration.GetSection("Logging"));
                loggerFactory.AddDebug();
            }

            app.UseApplicationInsightsRequestTelemetry();
            app.UseApplicationInsightsExceptionTelemetry();

            app.UseMvc();
        }

        private void InitCouchbaseCluster(string bucketName, string bucketPassword)
        {
            var url = Configuration["Couchbase.Url"];

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
            return new BlobRulesDriver(new Uri(Configuration["RulesBlob.Url"]), new SystemWebClientFactory());
        }

        IRuleParser GetRulesParser()
        {
            return JPadRulesParserAdapter.Convert(new JPadParser(new ParserSettings(
                comparers: new Dictionary<string, ComparerDelegate>()
                {
                    ["version"] = Version.Parse
                })));
        }
    }
}

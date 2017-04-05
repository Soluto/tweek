using System;
using System.Collections.Generic;
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
using Newtonsoft.Json.Serialization;
using FSharpUtils.Newtonsoft;
using Tweek.Utils;
using Tweek.Drivers.CouchbaseDriver;
using Engine.Core.Rules;
using Engine.Drivers.Context;
using Tweek.JPad.Utils;
using Tweek.JPad;
using Tweek.ApiService.NetCore.Diagnostics;
using System.Reflection;
using System.Threading;
using App.Metrics;
using App.Metrics.Health;
using Microsoft.AspNetCore.Mvc;
using Tweek.ApiService.NetCore.Security;
using Tweek.ApiService.NetCore.Addons;

namespace Tweek.ApiService.NetCore
{

    class TweekContractResolver : DefaultContractResolver
    {
        protected override JsonContract CreateContract(Type objectType)
        {
            var contract = base.CreateContract(objectType);

            if (typeof(JsonValue).GetTypeInfo().IsAssignableFrom(objectType.GetTypeInfo()))
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
            services.AddSingleton<CheckReadConfigurationAccess>(Authorization.CreateReadConfigurationAccessChecker(tweek));
            services.AddSingleton<CheckWriteContextAccess>(Authorization.CreateWriteContextAccessChecker(tweek));
            services.AddSingleton<IContextDriver>(contextDriver);
            services.AddSingleton(parser);
            services.AddSingleton<IEnumerable<IDiagnosticsProvider>>(new IDiagnosticsProvider[] {rulesDiagnostics, couchbaseDiagnosticsProvider, new EnvironmentDiagnosticsProvider()});
            var tweekContactResolver = new TweekContractResolver();
            var jsonSerializer = new JsonSerializer() { ContractResolver = tweekContactResolver };
            services.AddSingleton(jsonSerializer);
            services.AddMvc(options => options.AddMetricsResourceFilter())
                .AddJsonOptions(opt =>
                {
                    opt.SerializerSettings.ContractResolver = tweekContactResolver;
                });
            services.AddCors(options =>
            {
                options.AddPolicy("All",
                    builder => builder.AllowAnyOrigin()
                        .AllowAnyMethod()
                        .AllowAnyHeader()
                        .AllowCredentials());
            });

            var envProvider = new EnvironmentDiagnosticsProvider();

            services
                .AddMetrics()
                .AddJsonSerialization()
                .AddHealthChecks(factory =>
                {
                    factory.RegisterProcessPrivateMemorySizeHealthCheck("Private Memory Size", 1);
                    factory.RegisterProcessVirtualMemorySizeHealthCheck("Virtual Memory Size", 1);
                    factory.RegisterProcessPhysicalMemoryHealthCheck("Working Set (physical memory)", 1);
                    factory.RegisterPingHealthCheck("google ping", "google.com", TimeSpan.FromSeconds(10));

                    factory.Register(couchbaseDiagnosticsProvider.Name, 
                        ()=> Task.FromResult(couchbaseDiagnosticsProvider.IsAlive() ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy("Couchbase not alive")));

                    factory.Register(rulesDiagnostics.Name,
                        () => Task.FromResult(rulesDiagnostics.IsAlive() ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy("RulesDriverStatusService check failed")));

                    factory.Register(envProvider.Name,
                        () => Task.FromResult(envProvider.IsAlive() ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy("Environment is not healty")));
                })
                .AddMetricsMiddleware(Configuration);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                loggerFactory.AddConsole(Configuration.GetSection("Logging"));
                loggerFactory.AddDebug();
            }

            app.UseAuthenticationProviders(Configuration, loggerFactory.CreateLogger("AuthenticationProviders"));
            app.InstallAddons(Configuration);
            app.UseMetrics();
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
                Comparers: Microsoft.FSharp.Core.FSharpOption<IDictionary<string, ComparerDelegate>>.Some(new Dictionary<string, ComparerDelegate>()
                {
                    ["version"] = Version.Parse
                }), Sha1Provider: Microsoft.FSharp.Core.FSharpOption<Sha1Provider>.Some((s)=>
                {
                    using (var sha1 = System.Security.Cryptography.SHA1.Create())
                    {
                        return sha1.ComputeHash(s);
                    }
                }))));
        }
    }
}

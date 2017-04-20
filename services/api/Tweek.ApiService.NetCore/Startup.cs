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
using App.Metrics.Configuration;
using App.Metrics.Extensions.Reporting.Graphite;
using App.Metrics.Extensions.Reporting.Graphite.Client;
using Microsoft.AspNetCore.Mvc;
using Tweek.ApiService.Addons;
using Tweek.ApiService.NetCore.Security;
using Tweek.ApiService.NetCore.Addons;
using TweekContractResolver;

namespace Tweek.ApiService.NetCore
{

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
            
            services.InstallServiceAddons(Configuration);

            var rulesDriver = GetRulesDriver();
            var rulesDiagnostics = new RulesDriverStatusService(rulesDriver);

            services.AddSingleton<IDiagnosticsProvider>(rulesDiagnostics);
            services.AddSingleton<IDiagnosticsProvider>(new EnvironmentDiagnosticsProvider());

            var parser = GetRulesParser();
            var tweek = Task.Run(async () => await Engine.Tweek.Create(rulesDriver, parser)).Result;

            services.AddSingleton(tweek);
            services.AddSingleton(Authorization.CreateReadConfigurationAccessChecker(tweek));
            services.AddSingleton(Authorization.CreateWriteContextAccessChecker(tweek));
            services.AddSingleton(parser);

            var tweekContactResolver = new TweekContractResolver.TweekContractResolver();
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

            RegisterMetrics(services);
        }

        private void RegisterMetrics(IServiceCollection services)
        {
            var diagnosticsProviders = services.BuildServiceProvider().GetServices<IDiagnosticsProvider>();
            var healthChecksRegistrar = new HealthChecksRegistrar(diagnosticsProviders, Configuration["RulesBlob.Url"]);

            services
                .AddMetrics(options =>
                {
                    options.WithGlobalTags((globalTags, envInfo) =>
                    {
                        globalTags.Add("host", envInfo.HostName);
                        globalTags.Add("machine_name", envInfo.MachineName);
                        globalTags.Add("app_name", envInfo.EntryAssemblyName);
                        globalTags.Add("app_version", envInfo.EntryAssemblyVersion);
                    });
                })
                .AddJsonSerialization()
                .AddReporting(factory =>
                {
                    var appMetricsReporters = Configuration.GetSection("AppMetricsReporters");
                    foreach (var reporter in appMetricsReporters.GetChildren())
                    {
                        if (reporter.Key.Equals("graphite", StringComparison.OrdinalIgnoreCase))
                        {
                            factory.AddGraphite(new GraphiteReporterSettings
                            {
                                ConnectionType = ConnectionType.Tcp,
                                Host = reporter.GetValue<string>("Url"),
                                Port = reporter.GetValue("Port", 2003),
                                NameFormatter = new DefaultGraphiteNameFormatter(reporter.GetValue("Prefix", "TweekApi") +  ".{type}.{tag:host}.{context}.{tag:route}.{nameWithUnit}.{tag:http_status_code}")
                            });
                        }
                    }
                })
                .AddHealthChecks(healthChecksRegistrar.RegisterHelthChecks)
                .AddMetricsMiddleware(Configuration.GetSection("AspNetMetrics"));
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory,
            IApplicationLifetime lifetime)
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
            app.UseMetricsReporting(lifetime);
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

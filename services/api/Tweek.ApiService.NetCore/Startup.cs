﻿using App.Metrics;
using App.Metrics.Configuration;
using App.Metrics.Extensions.Reporting.Graphite;
using App.Metrics.Extensions.Reporting.Graphite.Client;
using App.Metrics.Health;
using Engine;
using Engine.Core.Rules;
using Engine.Drivers.Context;
using Engine.Drivers.Rules;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Scrutor;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Threading.Tasks;
using Engine.Rules.Validation;
using FSharpUtils.Newtonsoft;
using Microsoft.Extensions.PlatformAbstractions;
using Swashbuckle.AspNetCore.Swagger;
using Tweek.ApiService.Addons;
using Tweek.ApiService.NetCore.Addons;
using Tweek.ApiService.NetCore.Diagnostics;
using Tweek.ApiService.NetCore.Metrics;
using Tweek.ApiService.NetCore.Security;
using Tweek.ApiService.NetCore.Utils;
using Tweek.JPad;
using Tweek.JPad.Utils;
using Engine.Rules.Creation;
using static Engine.Core.Rules.Utils;
using static LanguageExt.Prelude;
using Engine.DataTypes;
using Newtonsoft.Json.Linq;

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

            services.RegisterAddonServices(Configuration);

            services.Decorate<IContextDriver>((driver, provider) => new TimedContextDriver(driver, provider.GetService<IMetrics>()));

            //services.AddSingleton<IDiagnosticsProvider>(new RulesDriverStatusService(blobRulesDriver));
            services.AddSingleton<IDiagnosticsProvider>(new EnvironmentDiagnosticsProvider());

            services.AddSingleton(CreateParserResolver());
            services.AddSingleton(provider =>
            {
                var parserResolver = provider.GetService<GetRuleParser>();
                var rulesDriver = provider.GetService<IRulesDriver>();
                return Task.Run(async () => await Engine.Tweek.Create(rulesDriver, parserResolver)).Result;
            });

            services.AddSingleton(provider => Authorization.CreateReadConfigurationAccessChecker(provider.GetService<ITweek>()));
            services.AddSingleton(provider => Authorization.CreateWriteContextAccessChecker(provider.GetService<ITweek>()));
            services.AddSingleton(provider => Validator.GetValidationDelegate(provider.GetService<GetRuleParser>()));

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

            RegisterMetrics(services);
            services.AdaptSingletons<IDiagnosticsProvider, HealthCheck>(inner => new DiagnosticsProviderDecorator(inner));
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("api", new Info
                {
                    Title = "Tweek Api",
                    License = new License {Name = "MIT", Url = "https://github.com/Soluto/tweek/blob/master/LICENSE" },
                    Version = Assembly.GetEntryAssembly()
                        .GetCustomAttribute<AssemblyInformationalVersionAttribute>()
                        .InformationalVersion
                });
                // Generate Dictionary<string,JsonValue> as JSON object in Swagger
                options.MapType(typeof(Dictionary<string,JsonValue>), () => new Schema {Type = "object"});

                var basePath = PlatformServices.Default.Application.ApplicationBasePath;
                var xmlPath = Path.Combine(basePath, "Tweek.ApiService.NetCore.xml");
                options.IncludeXmlComments(xmlPath);

            });
        }

        private void RegisterMetrics(IServiceCollection services)
        {
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
                .AddHealthChecks()
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
            app.UseSwagger(options =>
            {
                options.RouteTemplate = "{documentName}/swagger.json";
                options.PreSerializeFilters.Add((swaggerDoc, httpReq) =>
                {
                    swaggerDoc.Host = httpReq.Host.Value;
                    swaggerDoc.Schemes = new[] {httpReq.Scheme};
                });
            });
        }

        private static IRuleParser CreateJPadParser() => JPadRulesParserAdapter.Convert(new JPadParser(new ParserSettings(
                Comparers: Microsoft.FSharp.Core.FSharpOption<IDictionary<string, ComparerDelegate>>.Some(new Dictionary<string, ComparerDelegate>()
                {
                    ["version"] = Version.Parse
                }), sha1Provider: (s)=>
                {
                    using (var sha1 = System.Security.Cryptography.SHA1.Create())
                    {
                        return sha1.ComputeHash(s);
                    }
                })));

        private static GetRuleParser CreateParserResolver()
        {
            var jpadParser = CreateJPadParser();

            var dict = new Dictionary<string, IRuleParser>(StringComparer.OrdinalIgnoreCase){
                ["jpad"] = jpadParser,
                ["const"] = ConstValueParser
            };

            return x=>dict[x];
        }
    }
}

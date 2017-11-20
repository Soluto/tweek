using App.Metrics;
using App.Metrics.Configuration;
using App.Metrics.Health;
using FSharpUtils.Newtonsoft;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.PlatformAbstractions;
using Newtonsoft.Json;
using Swashbuckle.AspNetCore.Swagger;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using Tweek.ApiService.Addons;
using Tweek.ApiService.Diagnostics;
using Tweek.ApiService.Metrics;
using Tweek.ApiService.Security;
using Tweek.ApiService.Utils;
using Tweek.Engine;
using Tweek.Engine.Context;
using Tweek.Engine.Core.Rules;
using Tweek.Engine.Drivers.Context;
using Tweek.Engine.Drivers.Rules;
using Tweek.Engine.Rules.Creation;
using Tweek.Engine.Rules.Validation;
using Tweek.JPad;
using Tweek.JPad.Utils;

namespace Tweek.ApiService
{
    public class Startup
    {
        private ILoggerFactory loggerFactory;
        public Startup(IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();

            Configuration = builder.Build();
            this.loggerFactory = loggerFactory;
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.RegisterAddonServices(Configuration);

            services.Decorate<IContextDriver>((driver, provider) => new TimedContextDriver(driver, provider.GetService<IMetrics>()));

            services.AddSingleton<IDiagnosticsProvider>(ctx => new RulesRepositoryDiagnosticsProvider(ctx.GetServices<IRulesRepository>().Single()));
            services.AddSingleton<IDiagnosticsProvider>(new EnvironmentDiagnosticsProvider());

            services.AddSingleton(CreateParserResolver());
            services.AddSingleton<IRulesRepository>(provider => new RulesRepository(provider.GetService<IRulesDriver>(),
                TimeSpan.FromMilliseconds(Configuration.GetValue("Rules:FailureDelayInMs", 60000)), 
                provider.GetService<ILoggerFactory>().CreateLogger("RulesRepository")));
            services.AddSingleton(provider =>
            {
                var parserResolver = provider.GetService<GetRuleParser>();
                var rulesDriver = provider.GetService<IRulesRepository>();
                return Task.Run(async () => await Engine.Tweek.Create(rulesDriver, parserResolver)).Result;
            });
            services.AddSingleton(provider =>
            {
                var rulesDriver = provider.GetService<IRulesRepository>();
                return Task.Run(async () => await TweekIdentityProvider.Create(rulesDriver)).Result;
            });
            services.AddSingleton(provider => Authorization.CreateReadConfigurationAccessChecker(provider.GetService<ITweek>(), provider.GetService<TweekIdentityProvider>()));
            services.AddSingleton(provider => Authorization.CreateWriteContextAccessChecker(provider.GetService<ITweek>(), provider.GetService<TweekIdentityProvider>()));
            services.AddSingleton(provider => Validator.GetValidationDelegate(provider.GetService<GetRuleParser>()));

            var tweekContactResolver = new TweekContractResolver();
            var jsonSerializer = new JsonSerializer() { ContractResolver = tweekContactResolver };

            services.AddSingleton(jsonSerializer);
            services.AddMvc(options => options.AddMetricsResourceFilter())
                .AddJsonOptions(opt =>
                {
                    opt.SerializerSettings.ContractResolver = tweekContactResolver;
                });

            services.SetupCors(Configuration);

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
                var xmlPath = Path.Combine(basePath, "Tweek.ApiService.xml");
                options.IncludeXmlComments(xmlPath);

            });
            services.ConfigureAuthenticationProviders(Configuration,  loggerFactory.CreateLogger("AuthenticationProviders"));
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

            app.InstallAddons(Configuration);
            app.UseAuthentication();
            app.UseMetrics();
            app.UseMvc();
            app.UseMetricsReporting(lifetime);
            app.UseWhen((ctx)=>ctx.Request.Path == "/api/swagger.json", r=>r.UseCors(p=>p.AllowAnyHeader().AllowAnyOrigin().WithMethods("GET")));
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
                ["const"] = Engine.Core.Rules.Utils.ConstValueParser
            };

            return x=>dict[x];
        }
    }
}

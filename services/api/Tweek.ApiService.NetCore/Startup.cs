using App.Metrics;
using App.Metrics.Configuration;
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
using Engine.Context;
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
using Tweek = Engine.Tweek;
using LanguageExt;
using static LanguageExt.Prelude;
using Engine.DataTypes;
using ConfigurationPath = Engine.DataTypes.ConfigurationPath;
using Tweek.Utils;

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
            services.Decorate<IContextDriver>((driver, provider) => 
              new TimedContextDriver(driver, provider.GetService<IMetrics>()));

            services.Decorate<IContextDriver>((driver, provider) => CreateInputValidationDriverDecorator(provider, driver));

            //services.AddSingleton<IDiagnosticsProvider>(new RulesDriverStatusService(blobRulesDriver));
            services.AddSingleton<IDiagnosticsProvider>(new EnvironmentDiagnosticsProvider());

            services.AddSingleton(CreateParserResolver());
            services.AddSingleton(provider =>
            {
                var parserResolver = provider.GetService<GetRuleParser>();
                var rulesDriver = provider.GetService<IRulesDriver>();
                return Task.Run(async () => await Engine.Tweek.Create(rulesDriver, parserResolver)).Result;
            });
            services.AddSingleton(provider =>
            {
                var rulesDriver = provider.GetService<IRulesDriver>();
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
                var xmlPath = Path.Combine(basePath, "Tweek.ApiService.NetCore.xml");
                options.IncludeXmlComments(xmlPath);

            });
        }

        private IContextDriver CreateInputValidationDriverDecorator(IServiceProvider provider, IContextDriver decoratedDriver)
        {
            InputValidationContextDriver.Mode ParseMode(string raw)
            {
                switch(raw){
                  case "Flexible":
                      return InputValidationContextDriver.Mode.AllowUndefinedProperties;
                  case "Strict":
                      return InputValidationContextDriver.Mode.Strict;
                  default:
                      throw new ArgumentException($"Invalid context validation mode ${raw}");
                }
            }

            InputValidationContextDriver DecoratorFactory(InputValidationContextDriver.Mode mode, bool reportOnly)
            {
                return new InputValidationContextDriver(
                    decoratedDriver, 
                    provider.GetService<ILogger<InputValidationContextDriver>>(),
                    SchemaProvider(provider),
                    CustomTypeDefinitionProvider(provider),
                    mode,
                    reportOnly
                    );
            }

            var reportOnlyFromConfig = string.Equals(Configuration["Context:Validation:Error_Policy"], "BYPASS_LOG");
            var modeRaw =  Configuration["Context:Validation:Mode"];
            if (string.IsNullOrEmpty(modeRaw) || modeRaw == "Off"){
                return decoratedDriver;
            }

            return DecoratorFactory(ParseMode(modeRaw), reportOnlyFromConfig);
        }

        private InputValidationContextDriver.CustomTypeDefinitionProvider CustomTypeDefinitionProvider(IServiceProvider provider)
        {
            var tweek = provider.GetService<ITweek>();

            return typeName => {
                var key = $"@tweek/custom_types/{typeName}";
                var configuration = provider.GetService<ITweek>().Calculate(new [] { new ConfigurationPath(key)}, new HashSet<Identity>(),
                 i => ContextHelpers.EmptyContext);

                //ugly, but fix weird compilation issue
                return (configuration as IDictionary<ConfigurationPath, ConfigurationValue>)
                  .TryGetValue(key)
                  .Map(raw => raw.Value.Deserialize<CustomTypeDefinition>());
            };   
        }
        private InputValidationContextDriver.IdentitySchemaProvider SchemaProvider(IServiceProvider provider)
        {
            var tweek = provider.GetService<ITweek>();

            return identityType => {
                var key = $"@tweek/schema/{identityType}";
                var configuration = provider.GetService<ITweek>().Calculate(new [] { new ConfigurationPath(key)}, new System.Collections.Generic.HashSet<Identity>(),
                 i => ContextHelpers.EmptyContext);
                
                //ugly, but fix weird compilation issue
                return (configuration as IDictionary<ConfigurationPath, ConfigurationValue>).TryGetValue(key).Map(value => value.Value);
            };
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

            app.UseAuthenticationProviders(Configuration, loggerFactory.CreateLogger("AuthenticationProviders"));
            app.InstallAddons(Configuration);
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
                ["const"] = ConstValueParser
            };

            return x=>dict[x];
        }
    }
}

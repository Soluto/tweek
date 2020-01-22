using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Serilog;
using Serilog.Formatting.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Tweek.ApiService.Addons;
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
using LanguageExt;
using ConfigurationPath = Tweek.Engine.DataTypes.ConfigurationPath;
using Tweek.Engine.DataTypes;
using static LanguageExt.Prelude;
using System.Linq;
using App.Metrics;
using Tweek.ApiService.Patches;
using App.Metrics.Formatters.Prometheus;
using Microsoft.AspNetCore.Http.Features;
using App.Metrics.Health;

namespace Tweek.ApiService
{
    public class Startup
    {
        private static System.Collections.Generic.HashSet<Identity> EmptyIdentitySet = new System.Collections.Generic.HashSet<Identity>();
        private ILoggerFactory loggerFactory;
        public Startup(IWebHostEnvironment env, ILoggerFactory loggerFactory)
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

            services.Decorate<IContextDriver>((driver, provider) =>
              new TimedContextDriver(driver, provider.GetService<IMetrics>()));
            services.Decorate<IContextDriver>((driver, provider) => CreateInputValidationDriverDecorator(provider, driver));
            services.Decorate<IRulesDriver>((driver, provider) => new TimedRulesDriver(driver, provider.GetService<IMetrics>));

            services.AddSingleton(CreateParserResolver());

            var rulesetVersionProvider = Configuration.GetValue("RulesetVersionProvider", "SampleVersionProvider");
            services.AddSingleton<IRulesetVersionProvider>(provider =>
            {
                switch (rulesetVersionProvider)
                {
                    case "NatsVersionProvider":
                        return new NatsVersionProvider(provider.GetService<IRulesDriver>(),
                            Configuration.GetValue<string>("Rules:Nats:Endpoint"),
                            provider.GetService<ILoggerFactory>().CreateLogger("NatsVersionProvider"));
                    default:
                        return new SampleVersionProvider(provider.GetService<IRulesDriver>(),
                            TimeSpan.FromMilliseconds(Configuration.GetValue("Rules:SampleIntervalInMs", 30000)));
                }
            });

            var failureDelayInMs = Configuration.GetValue("Rules:FailureDelayInMs", 60000);
            var versionTimeoudInMs = Configuration.GetValue("Rules:VersionTimeoutInMs", failureDelayInMs * 3);
            services.AddSingleton<IRulesRepository>(provider => new RulesRepository(provider.GetService<IRulesDriver>(),
                provider.GetService<IRulesetVersionProvider>(),
                TimeSpan.FromMilliseconds(failureDelayInMs),
                TimeSpan.FromMilliseconds(versionTimeoudInMs),
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
            
            services.AddMvc()
                .AddNewtonsoftJson(options =>
                {
                    options.SerializerSettings.ContractResolver = tweekContactResolver;
                });

            
            services.SetupCors(Configuration);
            services.ConfigureAuthenticationProviders(Configuration, loggerFactory.CreateLogger("AuthenticationProviders"));

            services.AddMetrics(AppMetrics.CreateDefaultBuilder()
                .OutputMetrics.AsPrometheusPlainText()
                .Build());
        
            services.AddMetricsTrackingMiddleware();
            services.AddMetricsEndpoints(options => {
                options.MetricsEndpointOutputFormatter =  new MetricsPrometheusTextOutputFormatter();
                options.MetricsTextEndpointOutputFormatter = new MetricsPrometheusTextOutputFormatter();
            });

            var healthChecks = AppMetricsHealth.CreateDefaultBuilder()
                .HealthChecks.RegisterFromAssembly(services)
                .BuildAndAddTo(services);

            services.AddHealth(healthChecks);
            services.AddHealthEndpoints();
            
        }

        private IContextDriver CreateInputValidationDriverDecorator(IServiceProvider provider, IContextDriver driver)
        {
            var mode = match(Configuration["Context:Validation:Mode"]?.ToLower(),
                with("flexible", (_) => Some(SchemaValidation.Mode.AllowUndefinedProperties)),
                with("strict", (_) => Some(SchemaValidation.Mode.Strict)),
                with("off", (_) => Option<SchemaValidation.Mode>.None),
                with((string)null, (_) => Option<SchemaValidation.Mode>.None),
                (raw) => throw new ArgumentException($"Invalid context validation mode ${raw}")
            );


            return match(mode, (Func<SchemaValidation.Mode, IContextDriver>)((m) =>
            {
                var reportOnly = Configuration["Context:Validation:ErrorPolicy"]?.ToLower() == "bypass_log";
                var logger = loggerFactory.CreateLogger<InputValidationContextDriver>();
                var tweek = provider.GetService<ITweek>();
                var rulesRepository = provider.GetService<IRulesRepository>();
                var driverWithValidation = new InputValidationContextDriver(
                    (IContextDriver)driver,
                    CreateSchemaProvider(tweek, rulesRepository, m),
                    reportOnly
                    );

                driverWithValidation.OnValidationFailed += (message) => logger.LogWarning(message);
                return driverWithValidation;
            }), () => driver);
        }

        private SchemaValidation.Provider CreateSchemaProvider(ITweek tweek,  IRulesRepository rulesProvider, SchemaValidation.Mode mode)
        {
            var logger = loggerFactory.CreateLogger("SchemaValidation.Provider");

            SchemaValidation.Provider CreateValidationProvider(){
                logger.LogInformation("updating schema");
                var schemaValues = tweek.Calculate(new[] {new ConfigurationPath("@tweek/schema/_")}, EmptyIdentitySet,
                    i => ContextHelpers.EmptyContext);
                schemaValues.EnsureSuccess();

                var schemaIdentities = schemaValues.ToDictionary(x=> x.Key.Name, x=> x.Value.Value);

                var customTypesValues = tweek.Calculate(new[] {new ConfigurationPath("@tweek/custom_types/_")}, EmptyIdentitySet,
                    i => ContextHelpers.EmptyContext);
                customTypesValues.EnsureSuccess();

                var customTypes = customTypesValues.ToDictionary(x=>x.Key.Name, x=> CustomTypeDefinition.FromJsonValue(x.Value.Value));

                return SchemaValidation.Create(schemaIdentities, customTypes, mode);
            }

            var validationProvider = CreateValidationProvider();

            rulesProvider.OnRulesChange += (_)=>{
                validationProvider = CreateValidationProvider();
            };

            return (p)=>validationProvider(p);
        }


        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env, ILoggerFactory loggerFactory,
            IHostApplicationLifetime lifetime)
        {
            app.UseMetricsAllMiddleware();
            Log.Logger = new LoggerConfiguration()
                .ReadFrom.Configuration(Configuration)
                .WriteTo.Console(new JsonFormatter())
                .Enrich.FromLogContext()
                .CreateLogger();

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            app.InstallAddons(Configuration);
            app.UseRouting();
            app.UseCors();
            app.UseAuthentication();
            app.UseAppMetricsEndpointRoutesResolver();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapGet("health", endpoints.CreateApplicationBuilder()
                .Use((context, next)=>{
                    var syncIOFeature = context.Features.Get<IHttpBodyControlFeature>();
                    if (syncIOFeature != null)
                    {
                        syncIOFeature.AllowSynchronousIO = true;
                    }
                    return next();
                }).UseRouting().UseHealthAllEndpoints().Build());

                endpoints.MapGet("metrics", endpoints.CreateApplicationBuilder()
                .Use((context, next)=>{
                    var syncIOFeature = context.Features.Get<IHttpBodyControlFeature>();
                    if (syncIOFeature != null)
                    {
                        syncIOFeature.AllowSynchronousIO = true;
                    }
                    return next();
                }).UseRouting().UseMetricsAllEndpoints().Build());
            });
        }

        private static IRuleParser CreateJPadParser() => JPadRulesParserAdapter.Convert(new JPadParser(new ParserSettings(
                Comparers: Microsoft.FSharp.Core.FSharpOption<IDictionary<string, ComparerDelegate>>.Some(new Dictionary<string, ComparerDelegate>()
                {

                    ["version"] = Version.Parse
                }), sha1Provider: (s) =>
                {
                    using (var sha1 = System.Security.Cryptography.SHA1.Create())
                    {
                        return sha1.ComputeHash(s);
                    }
                })));

        private static GetRuleParser CreateParserResolver()
        {
            var jpadParser = CreateJPadParser();

            var dict = new Dictionary<string, IRuleParser>(StringComparer.OrdinalIgnoreCase)
            {
                ["jpad"] = jpadParser,
                ["const"] = Engine.Core.Rules.Utils.ConstValueParser,
                ["alias"] = Engine.Core.Rules.Utils.KeyAliasParser,
            };

            return x => dict[x];
        }
    }
}

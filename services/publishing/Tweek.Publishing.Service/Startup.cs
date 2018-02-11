using System;
using System.Reactive.Linq;
using System.Reflection;
 using System.Text;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Minio;
using Newtonsoft.Json;
using Polly;
using Tweek.Publishing.Service.Handlers;
using Tweek.Publishing.Service.Messaging;
using Tweek.Publishing.Service.Packing;
using Tweek.Publishing.Service.Storage;
using Tweek.Publishing.Service.Sync;
using Tweek.Publishing.Service.Utils;
using Tweek.Publishing.Service.Validation;

namespace Tweek.Publishing.Service
{
  public class Startup
  {
    private readonly IConfiguration Configuration;
    private readonly ILogger logger;
    
    public Startup(IConfiguration configuration, ILoggerFactory loggerFactory)
    {
      Configuration = configuration;
      logger = loggerFactory.CreateLogger("Default");
    }
    
    private void RunSSHDeamon(IApplicationLifetime lifetime, ILogger logger)
    {
      var sshdConfigLocation = Configuration.GetValue<string>("SSHD_CONFIG_LOCATION");
      var job = ShellHelper.Executor.ExecObservable("/usr/sbin/sshd", $"-f {sshdConfigLocation}")
          .Retry(3)
          .Select(x => (data: Encoding.Default.GetString(x.data), x.outputType))
          .Subscribe(x =>
          {
            if (x.outputType == OutputType.StdOut)
            {
              logger.LogInformation(x.data);
            }
            if (x.outputType == OutputType.StdErr)
            {
              logger.LogWarning(x.data);
            }
          }, ex =>
          {
            logger.LogError("error:" + ex.ToString());
            lifetime.StopApplication();
          });
      lifetime.ApplicationStopping.Register(job.Dispose);
    }
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddRouting();
    }

    private MinioClient CreateMinioClient(IConfiguration minioConfig)
    {
      var mc = new MinioClient(
          endpoint: minioConfig.GetValue<string>("Endpoint"),
          accessKey: minioConfig.GetValueInlineOrFile("AccessKey"),
          secretKey: minioConfig.GetValueInlineOrFile("SecretKey")
      );
      return minioConfig.GetValue("UseSSL", false) ? mc.WithSSL() : mc;
    }

    private void StartIntervalPublisher(IApplicationLifetime lifetime, NatsPublisher publisher, RepoSynchronizer repoSynchronizer, StorageSynchronizer storageSynchronizer)
    {
      var intervalPublisher = new IntervalPublisher(publisher);
      var job = intervalPublisher.PublishEvery(TimeSpan.FromSeconds(60), async () =>
      {
        var commitId = await repoSynchronizer.CurrentHead();
        await storageSynchronizer.Sync(commitId);
        logger.LogInformation($"SyncVersion:{commitId}");
        return commitId;
      });
      lifetime.ApplicationStopping.Register(job.Dispose);
    }

    public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory,
    IApplicationLifetime lifetime)
    {
      logger.LogInformation("Starting service");
      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
      }
      RunSSHDeamon(lifetime, logger);

      var executor = ShellHelper.Executor.WithWorkingDirectory(Configuration.GetValue<string>("REPO_LOCATION"));
      var git = executor.CreateCommandExecutor("git");
      var gitValidationFlow = new GitValidationFlow
      {
        Validators = {
                    (Patterns.Manifests, new CircularDependencyValidator()),
                    (Patterns.JPad, new CompileJPadValidator())
                }
      };

      var minioConfig = Configuration.GetSection("Minio");

      var storageClient = Policy.Handle<Exception>()
                            .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)))
                            .ExecuteAsync(() =>
                              MinioBucketStorage.GetOrCreateBucket(CreateMinioClient(minioConfig), minioConfig.GetValue("Bucket", "tweek-ruleset")))
                              .Result;

      var natsClient = new NatsPublisher(Configuration.GetSection("Nats").GetValue<string>("Endpoint"), "version");
      var repoSynchronizer = new RepoSynchronizer(git);
      var storageSynchronizer = new StorageSynchronizer(storageClient, executor, new Packer());

      storageSynchronizer.Sync(repoSynchronizer.CurrentHead().Result).Wait();

      app.UseRouter(router =>
      {
        router.MapGet("validate", ValidationHandler.Create(executor, gitValidationFlow));
        router.MapGet("sync", SyncHandler.Create(storageSynchronizer, repoSynchronizer, natsClient, logger));

        router.MapGet("log", async (req, res, routedata) => logger.LogInformation(req.Query["message"]));
        router.MapGet("health", async (req, res, routedata) => await res.WriteAsync(JsonConvert.SerializeObject(new { })));
        router.MapGet("version", async (req, res, routedata) => await res.WriteAsync(Assembly.GetEntryAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion));
      });
    }
  }
}
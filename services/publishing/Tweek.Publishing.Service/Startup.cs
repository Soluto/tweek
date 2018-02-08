using System;
using System.Reactive.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
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
    public IDisposable RunSSHDeamon(ILogger logger)
    {
      return ShellHelper.Executor.ExecObservable("/usr/sbin/sshd", "-f /tweek/sshd_config")
          .Retry()
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
          });
    }
    public void ConfigureServices(IServiceCollection services)
    {
      services.AddRouting();
    }

    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    private readonly IConfiguration Configuration;

    private MinioClient CreateMinioClient(IConfiguration minioConfig)
    {
      var mc = new MinioClient(
          endpoint: minioConfig.GetValue<string>("Endpoint"),
          accessKey: minioConfig.GetValueInlineOrFile("AccessKey"),
          secretKey: minioConfig.GetValueInlineOrFile("SecretKey")
      );
      return minioConfig.GetValue("UseSSL", false) ? mc.WithSSL() : mc;
    }

    public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory,
    IApplicationLifetime lifetime)
    {
      var logger = loggerFactory.CreateLogger("Default");
      logger.LogInformation("Starting service");
      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
      }
      RunSSHDeamon(logger);

      var git = ShellHelper.Executor.CreateCommandExecutor("git", p =>
      {
        p.WorkingDirectory = "/tweek/repo";
      });
      var gitValidationFlow = new GitValidationFlow
      {
        Validators = {
                    (Patterns.Manifests, new CircularDependencyValidator()),
                    (Patterns.JPad, new CompileJPadValidator())
                }
      };

      var minioConfig = Configuration.GetSection("Minio");

      var storageClient = Policy.Handle<Exception>()
                            .WaitAndRetryAsync(3, retryAttempt=> TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)))
                            .ExecuteAsync(()=>
                              MinioBucketStorage.GetOrCreateBucket(CreateMinioClient(minioConfig), minioConfig.GetValue("Bucket", "tweek-ruleset")))
                              .Result;

      var natsClient = new NatsPublisher(Configuration.GetSection("Nats").GetValue<string>("Endpoint"), "version");
      var repoSynchronizer = new RepoSynchronizer(git);
      var storageSynchronizer = new StorageSynchronizer(storageClient, ShellHelper.Executor, new Packer());
      var intervalPublisher = new IntervalPublisher(natsClient);
      var job = intervalPublisher.PublishEvery(TimeSpan.FromSeconds(60), async () => {
          var commitId = await repoSynchronizer.CurrentHead();
          await storageSynchronizer.Sync(commitId);
          logger.LogInformation($"Nats:SyncVersion:{commitId}");
          await natsClient.Publish(commitId);
          return commitId;
      });
      lifetime.ApplicationStopping.Register(job.Dispose);

      storageSynchronizer.Sync(repoSynchronizer.CurrentHead().Result).Wait();

      app.UseRouter(router =>
      {
        router.MapGet("sync", async (req, res, routdata) =>
        {
          try
          {
          await Policy.Handle<Exception>()
            .WaitAndRetryAsync(3, retryAttempt=> {
              return TimeSpan.FromSeconds(Math.Pow(2, retryAttempt));
            }, async (ex,timespan)=>{
              logger.LogWarning(ex.ToString());
              logger.LogWarning($"Sync:CommitFailed:Retrying");
              await Task.Delay(timespan);
            })
            .ExecuteAsync(async ()=>{
              var commitId = await repoSynchronizer.SyncToLatest();
              await storageSynchronizer.Sync(commitId);
              await natsClient.Publish(commitId);
              logger.LogInformation($"Sync:Commit:{commitId}");
            });
          }
          catch (Exception ex)
          {
            logger.LogError("failed to sync repo with upstram", ex);
            logger.LogError(ex.ToString());
            res.StatusCode = 500;
            await res.WriteAsync(ex.ToString());
          }
        });

        router.MapGet("log", async (req, res, routdata) =>
        {
          logger.LogInformation(req.Query["message"]);
        });

        router.MapGet("health", async (req, res, routdata) =>
        {
          await res.WriteAsync(JsonConvert.SerializeObject(new {}));
        });

        router.MapGet("version", async (req, res, routdata) =>
        {
          await res.WriteAsync(Assembly.GetEntryAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion);
        });

        router.MapGet("validate", async (req, res, routdata) =>
        {
          var oldCommit = req.Query["oldrev"].ToString().Trim();
          var newCommit = req.Query["newrev"].ToString().Trim();
          var quarantinePath = req.Query["quarantinepath"];
          var gitExecutor = ShellHelper.Executor.CreateCommandExecutor("git", pStart =>
          {
            pStart.Environment["GIT_ALTERNATE_OBJECT_DIRECTORIES"] = "/tweek/repo/./objects";
            pStart.Environment["GIT_OBJECT_DIRECTORY"] = quarantinePath;
            pStart.WorkingDirectory = "/tweek/repo";
          });
          try
          {
            await gitValidationFlow.Validate(oldCommit, newCommit, gitExecutor);
          }
          catch (Exception ex)
          {
            res.StatusCode = 400;
            await res.WriteAsync(ex.Message);
          }
        });

      });
    }
  }
}
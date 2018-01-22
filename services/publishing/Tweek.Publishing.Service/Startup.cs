using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reactive;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Reflection;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Bmbsqd.Async;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Minio;
using Polly;
using Polly.Retry;
using Tweek.Publishing.Service.Messaging;
using Tweek.Publishing.Service.Storage;
using Tweek.Publishing.Service.Sync;
using Tweek.Publishing.Service.Utils;
using Tweek.Publishing.Service.Validation;
using static LanguageExt.Prelude;

namespace Tweek.Publishing.Service
{
  public class Startup
  {
    public IDisposable RunSSHDeamon(ILogger logger)
    {
      return ShellHelper.Exec("/usr/sbin/sshd", "-f /tweek/sshd_config")
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
      var mc = new Minio.MinioClient(
          endpoint: minioConfig.GetValue<string>("Endpoint"),
          accessKey: minioConfig.GetValueInlineOrFile("AccessKey"),
          secretKey: minioConfig.GetValueInlineOrFile("SecretKey")
      );
      return minioConfig.GetValue<bool>("UseSSL", false) ? mc.WithSSL() : mc;
    }

    public static Func<T1,T2,T3, Task> Synchronized<T1,T2,T3>(Func<T1,T2,T3, Task> fn, ILogger logger){
        //var cq = new ConcurrentQueue<(Func<T1,T2,T3, Task>, TaskCompletionSource<Unit>)>();
        AsyncLock _lock = new AsyncLock();
        return async (t1,t2,t3)=>  {
            using (await _lock){
                logger.LogInformation("start");
                await fn(t1,t2,t3);
                logger.LogInformation("finished");
                return;
            };
        };
    }

    public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
    {
      var logger = loggerFactory.CreateLogger("Default");
      logger.LogInformation("Starting service");
      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
      }
      RunSSHDeamon(logger);

      var git = ShellHelper.CreateCommandExecutor("git", (p) =>
      {
        p.WorkingDirectory = "/tweek/repo";
      });
      var gitValidationFlow = new GitValidationFlow()
      {
        Validators = {
                    ("^manifests/.*\\.json$", new CircularDependencyValidator()),
                    ("^implementations/jpad/.*\\.jpad$", new CompileJPadValidator())
                }
      };

      var minioConfig = Configuration.GetSection("Minio");

      var storageClient = Policy.Handle<Exception>()
                            .WaitAndRetryAsync(3, (retryAttempt)=> TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)))
                            .ExecuteAsync(()=>
                              MinioBucketStorage.GetOrCreateBucket(CreateMinioClient(minioConfig), minioConfig.GetValue<string>("Bucket", "tweek-ruleset")))
                              .Result;

      var natsClient = new NatsPublisher(Configuration.GetSection("Nats").GetValue<string>("Endpoint"), "version");

      var repoSynchronizer = new RepoSynchronizer(git);
      var storageSynchronizer = new StorageSynchronizer(storageClient);

      storageSynchronizer.Sync(repoSynchronizer.CurrentHead().Result).Wait();

      app.UseRouter(router =>
      {
          
        router.MapGet("sync", async (req, res, routdata) =>
        {
          try
          {
            var commitId = await repoSynchronizer.SyncToLatest();
            await storageSynchronizer.Sync(commitId);
            await natsClient.Publish(commitId);
          }
          catch (Exception ex)
          {
            logger.LogError("failed to sync repo with upstram", ex);
            logger.LogError(ex.ToString());
            res.StatusCode = 500;
            await res.WriteAsync(ex.ToString());
            return;
          }
        });

        router.MapGet("log", async (req, res, routdata) =>
        {
          logger.LogInformation(req.Query["message"]);
        });

        router.MapGet("health", async (req, res, routdata) =>
        {

        });

        router.MapGet("version", async (req, res, routdata) =>
        {
          await res.WriteAsync(Assembly.GetEntryAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion);
        });

        router.MapGet("validate", async (req, res, routdata) =>
        {
          var oldCommit = req.Query["oldrev"].ToString().Trim();
          var newCommit = req.Query["newrev"].ToString().Trim();
          var qurantinePath = req.Query["qurantinepath"];
          var gitExecutor = ShellHelper.CreateCommandExecutor("git", (pStart) =>
          {
            pStart.Environment["GIT_ALTERNATE_OBJECT_DIRECTORIES"] = "/tweek/repo/./objects";
            pStart.Environment["GIT_OBJECT_DIRECTORY"] = qurantinePath;
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
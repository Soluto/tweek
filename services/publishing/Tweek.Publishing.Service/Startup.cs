using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reactive;
using System.Reactive.Disposables;
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
using Tweek.Publishing.Service.Storage;
using Tweek.Publishing.Service.Utils;
using Tweek.Publishing.Service.Validation;

namespace Tweek.Publishing.Service
{
    public class Startup
    {
        

        public IDisposable RunSSHDeamon(){
            return ShellHelper.Exec("/usr/sbin/sshd", "-f /tweek/sshd_config")
                .Retry()
                .Select(x=> (data: Encoding.Default.GetString(x.data), x.outputType))
                .Subscribe(x=>{
                    if (x.outputType == OutputType.StdOut){
                        logger.LogInformation(x.data);
                    }
                    if (x.outputType == OutputType.StdErr){
                        logger.LogWarning(x.data);
                    }
                }, ex=>{
                    logger.LogError("error:" +ex.ToString());
                });
            }


        public void ConfigureServices(IServiceCollection services)
        {
            services.AddRouting();
            RunSSHDeamon();
        }

        public Startup(IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();

            this.configuration = builder.Build();
            this.loggerFactory = loggerFactory;
            this.logger = loggerFactory.CreateLogger<Startup>();
        }

        private readonly IConfigurationRoot configuration;
        private readonly ILoggerFactory loggerFactory;
        private readonly ILogger<Startup> logger;

        private MinioClient CreateMinioClient(IConfiguration minioConfig){
            var mc = new Minio.MinioClient(
                endpoint: minioConfig.GetValue<string>("Endpoint"),
                accessKey: minioConfig.GetValueInlineOrFile("AccessKey"),
                secretKey: minioConfig.GetValueInlineOrFile("SecretKey")
            );
            return minioConfig.GetValue<bool>("UseSSL", false) ? mc.WithSSL() : mc;
        }
        
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            var git = ShellHelper.CreateCommandExecutor("git");
            var gitValidationFlow = new GitValidationFlow(){
                Validators = {
                    ("^manifests/.*\\.json", new CircularDependencyValidator()),
                    ("^implementations/.*\\.jpad", new CompileJPadValidator())
                }
            };

            var minioConfig = configuration.GetSection("Minio");

            var storageClient = new MinioBucketStorage(CreateMinioClient(minioConfig),
                                                      minioConfig.GetValue<string>("Bucket","tweek-ruleset"));

            var repoSynchronizer = new RepoSynchronizer(storageClient);

            app.UseRouter(router=>{
                router.MapGet("sync", async (req, res, routdata) => {
                    await git("git fetch origin '+refs/heads/*:refs/heads/*'");
                    await repoSynchronizer.Sync();
                });

                router.MapGet("log", async (req, res, routdata) => {

                });

                router.MapGet("health", async (req, res, routdata)=> {
                    
                });

                router.MapGet("version", async (req, res, routdata)=> {
                    await res.WriteAsync(Assembly.GetEntryAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion);
                });

                router.MapGet("validate", async (req, res, routdata)=> {
                    var oldCommit = req.Query["oldrev"].ToString().Trim();
                    var newCommit = req.Query["newrev"].ToString().Trim();
                    var qurantinePath = req.Query["qurantinepath"];
                    var gitExecutor = ShellHelper.CreateCommandExecutor("git", (pStart)=> {
                        pStart.Environment["GIT_ALTERNATE_OBJECT_DIRECTORIES"] = "/tweek/repo/./objects";
                        pStart.Environment["GIT_OBJECT_DIRECTORY"] = qurantinePath;
                        pStart.WorkingDirectory = "/tweek/repo";
                    });
                    try{
                        await gitValidationFlow.Validate(oldCommit, newCommit, gitExecutor);
                    }
                    catch (Exception ex){
                        res.StatusCode = 400;
                        await res.WriteAsync(ex.Message);
                    }
                });

            });
        }
    }
}
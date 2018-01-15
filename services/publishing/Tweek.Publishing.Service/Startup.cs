using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Reactive;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Tweek.Publishing.Common;

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
        
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            var git = ShellHelper.CreateCommandExecutor("git");

            app.UseRouter(router=>{
                router.MapGet("sync", async (req, res, routdata) => {
                    await git("git fetch origin '+refs/heads/*:refs/heads/*'");
                });

                router.MapGet("log", async (req, res, routdata) => {

                });

                router.MapGet("health", async (req, res, routdata)=> {
                    
                });

                router.MapGet("version", async (req, res, routdata)=> {
                    
                });

            });
        }
    }
}

using App.Metrics.AspNetCore;
using App.Metrics.AspNetCore.Health;
using App.Metrics.Formatters.Prometheus;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Serilog;
using System;
using System.Reflection;


namespace Tweek.ApiService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = WebHost.CreateDefaultBuilder(args)
                .ConfigureMetrics(
                builder =>
                {
                    builder.Configuration.Configure(
                        options =>
                        {
                            options.DefaultContextLabel = "Testing";
                            options.Enabled = false;
                            var tags = options.GlobalTags;
                            tags["host"] = Environment.MachineName;
                            tags["app_name"] = Assembly.GetEntryAssembly().GetName().Name;
                            tags["app_version"] = Assembly.GetEntryAssembly().GetCustomAttribute<AssemblyInformationalVersionAttribute>().InformationalVersion;
                        });
                })
                .UseKestrel(opts=> opts.Limits.MaxRequestLineSize = 128 * 1024)
                .UseStartup<Startup>()
                .UseSerilog()
                .Build();

            host.Run();
        }
    }
}

using Microsoft.AspNetCore.Hosting;
using Serilog;
using System.IO;

namespace Tweek.ApiService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = new WebHostBuilder()
                .UseKestrel(opts=> opts.Limits.MaxRequestLineSize = 128 * 1024)
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseStartup<Startup>()
                .UseSerilog()
                .Build();
            
            host.Run();
        }
    }
}

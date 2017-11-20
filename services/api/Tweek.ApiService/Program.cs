using System.IO;
using Microsoft.AspNetCore.Hosting;

namespace Tweek.ApiService.NetCore
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = new WebHostBuilder()
                .UseKestrel(opts=> opts.Limits.MaxRequestLineSize = 128 * 1024)
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseStartup<Startup>()
                .Build();
            
            host.Run();
        }
    }
}

using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Builder;

namespace Tweek.ApiService.NetCore
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var host = new WebHostBuilder()
                .UseKestrel(opts=> opts.Limits.MaxRequestLineSize = 128 * 1024)
                .UseContentRoot(Directory.GetCurrentDirectory())
                .UseApplicationInsights()
                .UseStartup<Startup>()
                .Build();
            
            host.Run();
        }
    }
}

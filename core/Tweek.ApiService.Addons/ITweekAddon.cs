using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using Microsoft.Extensions.Logging;

namespace Tweek.ApiService.Addons
{
    public interface ITweekAddon
    {
        void Install(IApplicationBuilder builder, IConfiguration configuration, ILoggerFactory loggerFactory);
        void Register(IServiceCollection services, IConfiguration configuration);
    }
}

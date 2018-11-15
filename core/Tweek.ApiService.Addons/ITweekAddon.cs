using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using Microsoft.Extensions.Logging;
using Tweek.Engine.Drivers.Context;

namespace Tweek.ApiService.Addons
{
    public interface ITweekAddon
    {
        void Use(IApplicationBuilder builder, IConfiguration configuration);
        void Configure(IServiceCollection services, IConfiguration configuration);
    }
}

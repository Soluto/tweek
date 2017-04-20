using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace Tweek.ApiService.Addons
{
    public interface ITweekAddon
    {
        void Install(IApplicationBuilder builder, IConfiguration configuration);
    }

    public interface ITweekServiceAddon
    {
        void Register(IServiceCollection services, IConfiguration configuration);
    }
}

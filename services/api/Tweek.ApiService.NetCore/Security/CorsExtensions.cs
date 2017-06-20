using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LanguageExt;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Tweek.ApiService.NetCore.Security
{
    public static class CorsExtensions
    {
        public static void SetupCors(this IServiceCollection services, IConfiguration configuration)
        {
            if (!configuration.GetValue<bool>("CorsEnabled")) return;

            var corsPolicies = configuration.GetSection("CorsPolicies");
            if (corsPolicies.GetChildren().Length() == 0)
            {
                services.AddCors(options => options.AddPolicy("Keys",
                    builder => builder
                        .AllowCredentials()
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowAnyOrigin()
                ));
            }
            else
            {
                foreach (var policy in corsPolicies.GetChildren())
                {
                    Console.WriteLine($"CORS POLICY {policy.Key}");
                    services.AddCors(options => options.AddPolicy(policy.Key, builder =>
                        {
                            builder.WithHeaders(policy.GetSection("Headers")?.Value?.Split(',') ?? new[] {""})
                                .WithMethods(policy.GetSection("Methods")?.Value?.Split(',') ?? new[] {""})
                                .WithOrigins(policy.GetSection("Origins")?.Value?.Split(',') ?? new[] {""})
                                .WithExposedHeaders(
                                    policy.GetSection("ExposedHeaders")?.Value?.Split(',') ?? new[] {""});

                            if (policy.GetValue<bool>("AllowCredentials"))
                            {
                                builder.AllowCredentials();
                            }
                            else
                            {
                                builder.DisallowCredentials();
                            }

                            var maxPreflightAge = policy.GetValue<double>("MaxPreflightAge");
                            if (maxPreflightAge != 0)
                            {
                                builder.SetPreflightMaxAge(TimeSpan.FromSeconds(maxPreflightAge));
                            }
                        }
                    ));
                }
            }
        }
    }
}

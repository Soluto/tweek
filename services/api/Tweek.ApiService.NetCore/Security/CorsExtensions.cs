﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using LanguageExt;
using Microsoft.AspNetCore.Cors.Infrastructure;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Tweek.ApiService.NetCore.Security
{
    public static class CorsExtensions
    {
        public const string DEFAULT_POLICY_NAME = "Keys";

        public static void SetupCors(this IServiceCollection services, IConfiguration configuration)
        {
            if (!configuration.GetValue<bool>("CorsEnabled")) return;

            var corsPolicies = configuration.GetSection("CorsPolicies");
            if (corsPolicies.GetChildren().All(section => section.Key != DEFAULT_POLICY_NAME))
            {
                services.AddCors(options => options.AddPolicy(DEFAULT_POLICY_NAME,
                    builder => builder
                        .AllowCredentials()
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowAnyOrigin()
                ));
            }

            foreach (var policyConfiguration in corsPolicies.GetChildren())
            {
                var headers = policyConfiguration.GetSection("Headers").Value?.Split(',');
                var methods = policyConfiguration.GetSection("Methods").Value?.Split(',');
                var origins = policyConfiguration.GetSection("Origins").Value?.Split(',');
                var exposedHeaders = policyConfiguration.GetSection("ExposedHeaders").Value?.Split(',');

                if (headers == null || methods == null || origins == null || exposedHeaders == null)
                {
                    throw new InvalidOperationException(
                        $"Missing configuration fields for {policyConfiguration.Key}, please specify Headers, Methods, Origins and ExposedHeaders");
                }

                var policyBuilder = new CorsPolicyBuilder(origins);
                policyBuilder
                    .WithHeaders(headers)
                    .WithMethods(methods)
                    .WithExposedHeaders(exposedHeaders);

                if (policyConfiguration.GetValue<bool>("AllowCredentials"))
                {
                    policyBuilder.AllowCredentials();
                }
                else
                {
                    policyBuilder.DisallowCredentials();
                }

                var maxPreflightAge = policyConfiguration.GetValue<double>("MaxPreflightAge");
                if (maxPreflightAge != 0)
                {
                    policyBuilder.SetPreflightMaxAge(TimeSpan.FromSeconds(maxPreflightAge));
                }

                services.AddCors(options => options.AddPolicy(policyConfiguration.Key, policyBuilder.Build()));
            }
        }
    }
}

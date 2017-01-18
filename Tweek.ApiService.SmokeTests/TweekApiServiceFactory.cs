using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RestEase;

namespace Tweek.ApiService.SmokeTests
{
    public static class TweekApiServiceFactory
    {
        public static ITweekApi GetTweekApiClient()
        {
            var targetBaseUrl = "http://localhost:56240";//Environment.GetEnvironmentVariable("TWEEK_SMOKE_TARGET");

            if (string.IsNullOrEmpty(targetBaseUrl))
            {
                throw new ArgumentException("Missing smoke tests target environment variable, make sure you set up 'TWEEK_SMOKE_TARGET' to the target hostname.");
            }

            return RestClient.For<ITweekApi>(targetBaseUrl);
        }
    }
}

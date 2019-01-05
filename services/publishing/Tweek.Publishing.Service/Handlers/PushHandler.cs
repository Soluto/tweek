using System;
using System.Threading.Tasks;
using App.Metrics;
using App.Metrics.Counter;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Polly;
using Polly.Retry;
using Tweek.Publishing.Service.Messaging;
using Tweek.Publishing.Service.Sync;

namespace Tweek.Publishing.Service.Handlers
{
    public class PushHandler
    {
        private static readonly CounterOptions Push = new CounterOptions{Context = "publishing", Name = "push"};
        private static readonly MetricTags Success = new MetricTags("Status", "Success");
        private static readonly MetricTags Failure = new MetricTags("Status", "Failure");

        public static Func<HttpRequest, HttpResponse, RouteData, Task> Create(SyncActor syncActor, IMetrics metrics)
        {
            return async (req, res, routedata) =>
            {
                var commitId = req.Query["commit"].ToString();
                try
                {
                    await syncActor.PushToUpstream(commitId);
                    metrics.Measure.Counter.Increment(Push, Success);
                }
                catch (Exception ex)
                {
                    metrics.Measure.Counter.Increment(Push, Failure);
                    res.StatusCode = 500;
                    await res.WriteAsync(ex.Message);
                }
                #pragma warning disable CS4014                
                syncActor.SyncToLatest();
                #pragma warning restore CS4014
            };
        }
    }
}
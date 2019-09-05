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
    public class SyncHandler
    {
        private static readonly CounterOptions SyncToLatest = new CounterOptions {Context = "publishing", Name = "sync_to_latest"};
        private static readonly MetricTags Success = new MetricTags("Status", "Success");
        private static readonly MetricTags Failure = new MetricTags("Status", "Failure");

        public static Func<HttpRequest, HttpResponse, RouteData, Task> Create(SyncActor syncActor,               
            AsyncRetryPolicy retryPolicy,
            IMetrics metrics,
            ILogger logger = null)
        {
            logger = logger ?? NullLogger.Instance;

            retryPolicy = retryPolicy ?? Policy.Handle<Exception>().RetryAsync();
            return async (req, res, routedata) =>
            {
                try
                {
                    await retryPolicy
                        .ExecuteAsync(syncActor.SyncToLatest);
                    metrics.Measure.Counter.Increment(SyncToLatest, Success);
                }
                catch (Exception ex)
                {
                    metrics.Measure.Counter.Increment(SyncToLatest, Failure);
                    res.StatusCode = 500;
                    await res.WriteAsync(ex.Message);
                }
            };
        }
    }
}
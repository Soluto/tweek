using System;
using System.Threading.Tasks;
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

        public static Func<HttpRequest, HttpResponse, RouteData, Task> Create(SyncActor syncActor,               
            RetryPolicy retryPolicy,
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
                }
                catch (Exception ex)
                {
                    res.StatusCode = 500;
                    await res.WriteAsync(ex.Message);
                }
            };
        }
    }
}
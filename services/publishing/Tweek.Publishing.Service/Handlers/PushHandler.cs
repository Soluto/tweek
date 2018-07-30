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
    public class PushHandler
    {
        public static Func<HttpRequest, HttpResponse, RouteData, Task> Create(SyncActor syncActor)
        {
            return async (req, res, routedata) =>
            {
                var commitId = req.Query["commit"].ToString();
                try
                {
                    await syncActor.PushToUpstream(commitId);
                }
                catch (Exception ex)
                {
                    res.StatusCode = 500;
                    await res.WriteAsync(ex.Message);
                }
                await syncActor.SyncToLatest();
            };
        }
    }
}
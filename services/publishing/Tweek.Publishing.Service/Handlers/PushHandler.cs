using System;
using System.Threading.Tasks;
using App.Metrics;
using App.Metrics.Counter;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Tweek.Publishing.Service.Sync;
using Tweek.Publishing.Helpers;
using static Tweek.Publishing.Service.Utils.ShellHelper;

namespace Tweek.Publishing.Service.Handlers
{
    public class PushHandler
    {
        private static readonly CounterOptions Push = new CounterOptions{Context = "publishing", Name = "push"};
        private static readonly MetricTags Success = new MetricTags("Status", "Success");
        private static readonly MetricTags Failure = new MetricTags("Status", "Failure");

        public static Func<HttpRequest, HttpResponse, RouteData, Task> Create(SyncActor syncActor, IMetrics metrics, HooksHelper hooksHelper)
        {
            return async (req, res, routedata) =>
            {
                var commitId = req.Query["commit"].ToString();
                if (!IsCommitIdString(commitId))
                {
                    res.StatusCode = 400;
                    await res.WriteAsync("Invalid commit id");
                    return;
                }

                try
                {
                    await syncActor.PushToUpstream(commitId);
                    metrics.Measure.Counter.Increment(Push, Success);

                    #pragma warning disable CS4014
                    hooksHelper.TriggerNotificationHooksForCommit(commitId);
                    #pragma warning restore CS4014
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
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
        public static Func<HttpRequest, HttpResponse, RouteData, Task> Create(StorageSynchronizer storageSynchronizer,
            RepoSynchronizer repoSynchronizer,
            NatsPublisher  publisher,
            ILogger logger = null)
        {
            async Task FullSync(){
                var upstreamCommit = await repoSynchronizer.SyncToLatest();
                await storageSynchronizer.Sync(upstreamCommit);
                await publisher.Publish("version",upstreamCommit);
                logger.LogInformation($"Sync:Commit:{upstreamCommit}");
            }
            logger = logger ?? NullLogger.Instance;
            return async (req, res, routedata) =>
            {
                var commitId = req.Query["commit"].ToString();
                try
                {
                    await repoSynchronizer.PushToUpstream(commitId);
                }
                catch (Exception ex)
                {
                    await publisher.Publish("push-failed", commitId);
                    logger.LogError("failed to sync repo with upstream", ex);
                    res.StatusCode = 500;
                    await res.WriteAsync(ex.Message);
                }
                FullSync();
            };
        }
    }
}
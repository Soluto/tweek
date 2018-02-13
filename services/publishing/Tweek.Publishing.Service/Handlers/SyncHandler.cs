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
        public static Func<HttpRequest, HttpResponse, RouteData, Task> Create(StorageSynchronizer storageSynchronizer,
            RepoSynchronizer repoSynchronizer,
            NatsPublisher natsPublisher,
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
                        .ExecuteAsync(async () =>
                        {
                            var commitId = await repoSynchronizer.SyncToLatest();
                            await storageSynchronizer.Sync(commitId);
                            await natsPublisher.Publish(commitId);
                            logger.LogInformation($"Sync:Commit:{commitId}");
                        });
                }
                catch (Exception ex)
                {
                    logger.LogError("failed to sync repo with upstram", ex);
                    logger.LogError(ex.ToString());
                    res.StatusCode = 500;
                    await res.WriteAsync(ex.ToString());
                }
            };
        }
    }
}
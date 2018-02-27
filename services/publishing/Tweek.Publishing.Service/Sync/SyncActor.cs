using System;
using System.Collections.Concurrent;
using System.Reactive.Disposables;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Polly.Retry;
using Tweek.Publishing.Service.Messaging;

namespace Tweek.Publishing.Service.Sync
{

    public class SyncActor
    {
        private readonly StorageSynchronizer _storageSynchronizer;

        private readonly BlockingCollection<(string, Func<Task<object>>, TaskCompletionSource<object>)> _queue = new BlockingCollection<(string, Func<Task<object>>, TaskCompletionSource<object>)>();

        public RepoSynchronizer _repoSynchronizer { get; }

        private readonly NatsPublisher _publisher;
        private readonly ILogger _logger;

        public SyncActor(StorageSynchronizer storageSynchronizer,
            RepoSynchronizer repoSynchronizer,
            NatsPublisher publisher,
            ILogger logger = null)
        {
            this._storageSynchronizer = storageSynchronizer;
            this._repoSynchronizer = repoSynchronizer;
            this._publisher = publisher;
            this._logger = logger;
        }

        private IDisposable Start()
        {
            CancellationTokenSource token = new CancellationTokenSource();
            Task.Run(async () =>
            {
                while (!token.IsCancellationRequested)
                {
                    var (actionName, action, tcs) = _queue.Take(token.Token);
                    try
                    {
                        tcs.SetResult(await action());
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError($"failed handling {actionName}", ex);
                        tcs.SetException(ex);
                    }
                }
            });
            return Disposable.Create(() => token.Cancel());
        }

        private TaskCompletionSource<object> AddAction(string actionName, Func<Task<object>> action)
        {
            var tcs = new TaskCompletionSource<object>();
            _queue.Add((actionName, action, tcs));
            return tcs;
        }

        public async Task SyncToLatest()
        {
            var tcs = AddAction(nameof(SyncToLatest), async () =>
            {
                var commitId = await _repoSynchronizer.SyncToLatest();
                await _storageSynchronizer.Sync(commitId);
                await _publisher.Publish("version", commitId);
                _logger.LogInformation($"Sync:Commit:{commitId}");
                return null;
            });
            await tcs.Task;
        }

        public async Task PushToUpstream(string commitId)
        {
            var tcs = AddAction(nameof(PushToUpstream), async () =>
            {
                try
                {
                    await _repoSynchronizer.PushToUpstream(commitId);
                }
                catch (Exception ex)
                {
                    await _publisher.Publish("push-failed", commitId);
                    ex.Data["commitId"] = commitId;
                    throw;
                }
                return null;
            });
            await tcs.Task;
        }

        public static SyncActor Create(StorageSynchronizer storageSynchronizer,
            RepoSynchronizer repoSynchronizer,
            NatsPublisher publisher,
            ILogger logger = null)
        {
            var actor = new SyncActor(storageSynchronizer, repoSynchronizer, publisher);
            actor.Start();
            return actor;
        }
    }
}
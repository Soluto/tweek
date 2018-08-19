using Couchbase.Core;
using System;
using System.Threading;
using System.Threading.Tasks;
using App.Metrics.Health;
using Polly;

namespace Tweek.Drivers.Context.Couchbase
{
    public class BucketConnectionHealthCheck : HealthCheck
    {
        private DateTime _lastSuccessCheck;

        private readonly string _bucketName;
        private readonly Func<string, IBucket> _getBucket;
        private readonly long DEFAULT_MAX_LATENCY_MILLISECONDS = TimeSpan.FromSeconds(0.5).Milliseconds;
        private readonly long _maxLatencyMilliseconds;

        public BucketConnectionHealthCheck(Func<string, IBucket> getBucket, string bucketNameToCheck, long maxLatencyMilliseconds)
            : base("CouchbaseConnection")
        {
            _getBucket = getBucket;
            _bucketName = bucketNameToCheck;
            _maxLatencyMilliseconds =
                maxLatencyMilliseconds == 0 ? DEFAULT_MAX_LATENCY_MILLISECONDS : maxLatencyMilliseconds;
        }

        protected override async Task<HealthCheckResult> CheckAsync(
            CancellationToken cancellationToken = new CancellationToken())
        {
            if (DateTime.UtcNow - _lastSuccessCheck > TimeSpan.FromSeconds(30))
            {
                try
                {
                    var bucket = _getBucket(_bucketName);
                    await UpsertHealthcheckKey(bucket);
                    _lastSuccessCheck = DateTime.UtcNow;
                }
                catch
                {
                    return HealthCheckResult.Unhealthy($"Unavailable since {_lastSuccessCheck}");
                }
            }

            return HealthCheckResult.Healthy();
        }

        private async Task UpsertHealthcheckKey(IBucket bucket)
        {
            var timeout = TimeSpan.FromMilliseconds(_maxLatencyMilliseconds);
            await Policy.Handle<Exception>()
                .WaitAndRetryAsync(3, retryAttempt => TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))).ExecuteAsync(
                    async () =>
                    {
                        var upsertTask = bucket.UpsertAsync("healthcheck", "test");
                        if (await Task.WhenAny(upsertTask, Task.Delay(timeout)) != upsertTask)
                        {
                            throw new Exception("Timeout upserting healthcheck key");
                        }

                        var upsertResult = await upsertTask;
                        if (!upsertResult.Success)
                        {
                            throw upsertResult.Exception ?? new Exception("Failed to upsert healthcheck key");
                        }
                    });
        }
    }
}
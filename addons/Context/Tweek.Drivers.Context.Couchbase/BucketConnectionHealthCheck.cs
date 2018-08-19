using Couchbase.Core;
using System;
using System.Threading;
using System.Threading.Tasks;
using App.Metrics.Health;

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
                    await TouchHealthcheckKey(bucket);
                    _lastSuccessCheck = DateTime.UtcNow;
                }
                catch
                {
                    return HealthCheckResult.Unhealthy($"Unavailable since {_lastSuccessCheck}");
                }
            }

            return HealthCheckResult.Healthy();
        }

        private async Task TouchHealthcheckKey(IBucket bucket)
        {
            var timeout = TimeSpan.FromMilliseconds(_maxLatencyMilliseconds);
            var expiration = timeout;
            if (!await bucket.ExistsAsync("healthcheck", timeout))
            {
                var insertResult = await bucket.InsertAsync("healthcheck", "test");
                if (!insertResult.Success)
                {
                    throw insertResult.Exception ?? new Exception("Failed to create healthcheck key");
                }
            }

            var touchResult = await bucket.TouchAsync("healthcheck", expiration, timeout);
            if (!touchResult.Success)
            {
                throw touchResult.Exception ??
                      new Exception($"Failed to touch healthcheck key within {timeout.TotalSeconds} seconds");
            }
        }
    }
}
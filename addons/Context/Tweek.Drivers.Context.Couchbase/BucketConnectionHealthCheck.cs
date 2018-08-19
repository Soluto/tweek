using Couchbase.Core;
using System;
using System.Diagnostics;
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
        private readonly long DEFAULT_MAX_LATENCY_MICROSECONDS = TimeSpan.FromSeconds(0.5).Milliseconds * 1000;
        private readonly long _maxLatencyMicroseconds;

        public BucketConnectionHealthCheck(Func<string, IBucket> getBucket, string bucketNameToCheck, long maxLatencyMicroseconds)
            : base("CouchbaseConnection")
        {
            _getBucket = getBucket;
            _bucketName = bucketNameToCheck;
            _maxLatencyMicroseconds =
                maxLatencyMicroseconds == 0 ? DEFAULT_MAX_LATENCY_MICROSECONDS : maxLatencyMicroseconds;
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
            if (!await bucket.ExistsAsync("healthcheck"))
            {
                var insertResult = await bucket.InsertAsync("healthcheck", "test");
                if (!insertResult.Success)
                {
                    throw insertResult.Exception ?? new Exception("Failed to create healthcheck key");
                }
            }

            var timeout = TimeSpan.FromMilliseconds(_maxLatencyMicroseconds / 1000.0);
            var expiration = timeout;
            var touchResult = await bucket.TouchAsync("healthcheck", expiration, timeout);
            if (!touchResult.Success)
            {
                throw touchResult.Exception ??
                      new Exception($"Failed to touch healthcheck key within {timeout.TotalSeconds} seconds");
            }
        }
    }
}
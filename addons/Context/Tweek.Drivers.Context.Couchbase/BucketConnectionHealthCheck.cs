using Couchbase.Core;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using App.Metrics.Health;
using Couchbase;
using Couchbase.Core.Monitoring;

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
                    _getBucket(_bucketName);
                    _lastSuccessCheck = DateTime.UtcNow;
                    var latencies = ClusterHelper.Get().Diagnostics().Services.Values.SelectMany(svcs => svcs)
                        .Filter(svc => svc.Type == ServiceType.KeyValue)
                        .Select(svc => svc.Latency);

                    if (latencies.Any(l => l > _maxLatencyMicroseconds))
                    {
                        throw new Exception("High latency");
                    }
                }
                catch
                {
                    return HealthCheckResult.Unhealthy($"Unavailable since {_lastSuccessCheck}");
                }
            }

            return HealthCheckResult.Healthy();
        }
    }
}
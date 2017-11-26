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

        public BucketConnectionHealthCheck(Func<string, IBucket> getBucket, string bucketNameToCheck)
            : base("CouchbaseConnection")
        {
            _getBucket = getBucket;
            _bucketName = bucketNameToCheck;
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
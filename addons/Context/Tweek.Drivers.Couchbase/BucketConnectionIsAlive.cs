using System;
using Couchbase.Core;
using Tweek.ApiService.Addons;

namespace Tweek.Drivers.Couchbase
{
    public class BucketConnectionIsAlive : IDiagnosticsProvider
    {
        public string Name { get; } = "CouchbaseConnectionIsAlive";
        private DateTime lastSuccessCheck;

        private readonly string _bucketName;
        private Func<string, IBucket> _getBucket;

        public BucketConnectionIsAlive(Func<string, IBucket> getBucket, string bucketNameToCheck)
        {
            _getBucket = getBucket;
            _bucketName = bucketNameToCheck;
        }

        public object GetDetails()
        {
            return new { IsConnectionAlive = IsAlive() };
        }

        public bool IsAlive()
        {
            if (DateTime.UtcNow - lastSuccessCheck < TimeSpan.FromSeconds(30)) return true;
            try
            {
                var bucket = _getBucket(_bucketName);
                lastSuccessCheck = DateTime.UtcNow;
                return true;
            }
            catch
            {
                return false;
            }
        }

    }
}
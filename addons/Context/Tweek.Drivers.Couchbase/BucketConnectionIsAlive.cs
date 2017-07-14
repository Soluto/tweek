using System;
using Couchbase.Core;
using Tweek.ApiService.Addons;

namespace Tweek.Drivers.Couchbase
{
    public class BucketConnectionIsAlive : IDiagnosticsProvider
    {
        public string Name { get; } = "CouchbaseConnectionIsAlive";

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
            try
            {
                _getBucket(_bucketName);
            }
            catch
            {
                return false;
            }

            return true;
        }

    }
}
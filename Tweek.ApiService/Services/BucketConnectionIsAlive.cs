using System;
using Couchbase;
using Couchbase.Core;
using Tweek.ApiService.Interfaces;

namespace Tweek.ApiService.Services
{
    public class BucketConnectionIsAlive : IDisposable, IDiagnosticsProvider
    {
        public string Name { get; } = "CouchbaseConnectionIsAlive";

        private readonly Cluster _cluster;
        private readonly string _bucketName;
        private IBucket _bucket;

        public BucketConnectionIsAlive(Cluster cluster, string bucketNameToCheck)
        {
            _cluster = cluster;
            _bucketName = bucketNameToCheck;
        }

        public object GetDetails()
        {
            return new { IsConnectionAlive = IsAlive() };
        }

        public bool IsAlive()
        {
            if (!_cluster.IsOpen(_bucketName))
            {
                _bucket = _cluster.OpenBucket(_bucketName);
            }

            return _cluster.IsOpen(_bucketName);
        }

        public void Dispose()
        {
            if (_bucket != null) _cluster.CloseBucket(_bucket);
        }
    }
}
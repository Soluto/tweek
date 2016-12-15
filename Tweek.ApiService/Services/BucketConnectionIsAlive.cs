using System;
using System.Diagnostics;
using Couchbase;
using Couchbase.Core;
using Tweek.ApiService.Interfaces;

namespace Tweek.ApiService.Services
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
            catch (Exception e)
            {
                Trace.TraceError("couchbase not alive", e);
                return false;
            }

            return true;
        }

    }
}
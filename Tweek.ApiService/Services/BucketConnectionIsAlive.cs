using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Couchbase;
using Couchbase.Core;
using Tweek.ApiService.Interfaces;

namespace Tweek.ApiService.Services
{
    public class BucketConnectionIsAlive : IIsAliveService, IDisposable
    {
        private Cluster mCluster;
        private string mBucketName;
        private IBucket mBucket;

        public BucketConnectionIsAlive(Cluster cluster, string bucketNameToCheck)
        {
            mCluster = cluster;
            mBucketName = bucketNameToCheck;
        }

        public bool IsAlive()
        {
            if (!mCluster.IsOpen(mBucketName))
            {
                mBucket = mCluster.OpenBucket(mBucketName);
            }

            return mCluster.IsOpen(mBucketName);
        }

        public void Dispose()
        {
            if (mBucket != null) mCluster.CloseBucket(mBucket);
        }
    }
}
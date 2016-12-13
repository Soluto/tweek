using Engine.Drivers.Context;
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.DataTypes;
using Couchbase;
using Couchbase.Core;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Dynamic;

namespace Tweek.Drivers.CouchbaseDriver
{
    public class CouchBaseDriver : IContextDriver, IDisposable
    {
        readonly Cluster _cluster;
        readonly string _bucketName;
        private IBucket _bucket;

        public CouchBaseDriver(Cluster cluster, string bucketName)
        {
            _bucketName = bucketName;
            _cluster = cluster;

            _bucket = null;
        }

        public string GetKey(Identity identity) => "identity_" + identity.Type + "_" + identity.Id;

        private IBucket GetOrOpenBucket()
        {
            if (_bucket == null || !_cluster.IsOpen(_bucketName))
            {
                Trace.TraceInformation("opening couchbase bucket");
                _bucket = _cluster.OpenBucket(_bucketName);
            }
            return _bucket;
        }

        public async Task InsertOrUpdate(string key,
            Func<IDictionary<string, string>, IDictionary<string, string>> updateFn)
        {
            var bucket = GetOrOpenBucket();
            IOperationResult<IDictionary<string, string>> result = null;
            var cas = (ulong)0;
            if (!await bucket.ExistsAsync(key))
            {
                var contextWithCreationDate = updateFn(new Dictionary<string, string>
                {
                    ["@CreationDate"] = DateTimeOffset.UtcNow.ToString()
                });
                result = await bucket.UpsertAsync(key, contextWithCreationDate, cas);
            }
            while (!(result?.Success ?? false) && cas != result?.Cas)
            {
                var doc = bucket.GetDocument<Dictionary<string, string>>(key);
                var newData = updateFn(doc.Content ?? new Dictionary<string, string>());
                cas = doc.Document.Cas;
                result = await bucket.UpsertAsync(key, newData, cas);
            }
            if (!(result?.Success ?? false))
            {
                throw result?.Exception ?? new Exception("failed to update couchbase");
            }
        }

        public async Task RemoveFromContext(Identity identity, string key)
        {
            var keyIdentity = GetKey(identity);
            await InsertOrUpdate(keyIdentity, dictionary => dictionary.ToImmutableDictionary().Remove(key));
        }

        public async Task AppendContext(Identity identity, Dictionary<string, string> context)
        {
            var key = GetKey(identity);
            await InsertOrUpdate(key, dictionary => dictionary.ToImmutableDictionary().SetItems(context));
        }

        public async Task<Dictionary<string, string>> GetContext(Identity identity)
        {
            var key = GetKey(identity);
            var data = await GetFromAllSources<Dictionary<string, string>>(key);
            if (data == null)
            {
                return new Dictionary<string, string>();
            }
            return data;
        }

        private async Task<T> GetFromAllSources<T>(string key) where T:class
        {
            var bucket = GetOrOpenBucket();
            var document = await bucket.GetAsync<T>(key);
            if (document.Success) return document.Value;
            if (document.Status == Couchbase.IO.ResponseStatus.KeyNotFound) return null;
            var replica = (await bucket.GetFromReplicaAsync<T>(key));
            if (replica.Success) return replica.Value;
            if (replica.Status == Couchbase.IO.ResponseStatus.KeyNotFound) return null;
            throw new AggregateException(document.Exception ?? new Exception(document.Message),
                                          replica.Exception ?? new Exception(replica.Message));
        }

        public async Task RemoveIdentityContext(Identity identity)
        {
            await GetOrOpenBucket().RemoveAsync(GetKey(identity));
        }

        public void Dispose()
        {
            if (_bucket != null){
                Trace.TraceInformation("closing couchbase bucket");
                _cluster.CloseBucket(_bucket);
            }
        }
    }
}

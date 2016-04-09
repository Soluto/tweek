using Engine.Drivers.Context;
using System;
using System.Collections.Generic;
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
                _bucket = _cluster.OpenBucket(_bucketName);
            }
            return _bucket;
        }

        public async Task AppendContext(Identity identity, Dictionary<string, string> context)
        {
            var key = GetKey(identity);
            var bucket = GetOrOpenBucket();
            
            if (!await bucket.ExistsAsync(key))
            {
                var contextWithCreationDate  = context.ContainsKey("@CreationDate") ? context : context
                    .Concat(new[] { new KeyValuePair<string, string>("@CreationDate", DateTimeOffset.UtcNow.ToString()) })
                    .ToDictionary(x => x.Key, x => x.Value);
                
                var result = await bucket.UpsertAsync(new Document<Dictionary<string,string>>
                    {
                        
                        Id = key,
                        Content = contextWithCreationDate
                });
            }
            else
            {
                    await context.Aggregate(
                    bucket.MutateIn<dynamic>(key),
                    (doc, item) => doc.Upsert(item.Key, item.Value)).ExecuteAsync();
            }
        }

        public async Task<Dictionary<string, string>> GetContext(Identity identity)
        {
            var key = GetKey(identity);
            using (var bucket = _cluster.OpenBucket(_bucketName))
            {
                var document = await bucket.GetDocumentAsync<Dictionary<string,string>>(key);
                if (document.Status == Couchbase.IO.ResponseStatus.KeyNotFound)
                {
                    return new Dictionary<string, string>();
                }
                if (!document.Success)
                    throw (document.Exception ?? new Exception(document.Message));
                return document.Content;
            }
        }

        public async Task RemoveIdentityContext(Identity identity)
        {
            await GetOrOpenBucket().RemoveAsync(GetKey(identity));
        }

        public void Dispose()
        {
            if (_bucket !=null) _cluster.CloseBucket(_bucket);
        }
    }
}

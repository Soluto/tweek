using Couchbase.Core;
using Couchbase.IO;
using FSharpUtils.Newtonsoft;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;

namespace Tweek.Drivers.CouchbaseDriver
{
    public class CouchBaseDriver : IContextDriver
    {
        readonly string _bucketName;
        private Func<string, IBucket> _getBucket;

        public CouchBaseDriver(Func<string, IBucket> getBucket,  string bucketName)
        {
            _bucketName = bucketName;
            _getBucket = getBucket;
        }

        public string GetKey(Identity identity) => "identity_" + identity.Type + "_" + identity.Id;

        public IBucket GetOrOpenBucket()
        {
            return _getBucket(_bucketName);
        }

        public async Task RemoveFromContext(Identity identity, string key)
        {
            var identityKey = GetKey(identity);
            var bucket = GetOrOpenBucket();
            var mutator = bucket.MutateIn<dynamic>(identityKey);
            var deleteResult = await mutator.Remove(key).ExecuteAsync();
            if (!deleteResult.Success) throw deleteResult.Exception ?? new Exception("Error deleting context property") { Data = { { "Identity_Key", identityKey } ,{ "Property", key } } };
        }

        public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            var key = GetKey(identity);
            var bucket = GetOrOpenBucket();
            if (!await bucket.ExistsAsync(key))
            {
                var contextWithCreationDate = new Dictionary<string, JsonValue>(context)
                {
                    ["@CreationDate"] = JsonValue.NewString(DateTimeOffset.UtcNow.ToString())
                };
                var insertResult = await bucket.InsertAsync(key, contextWithCreationDate);
                if (insertResult.Success) return;
                if (insertResult.Status != ResponseStatus.KeyExists) {
                    throw insertResult.Exception ?? new Exception("Error adding new identity context "){ Data ={ { "Identity_Key", key }}};
                }
            }
            var mutator = context.Aggregate(bucket.MutateIn<dynamic>(key), (acc, next)=> acc.Upsert(next.Key, next.Value));
            var updateResult = await mutator.ExecuteAsync();
            if (!updateResult.Success) throw updateResult.Exception ?? new Exception("Error updating identity conext") { Data = { { "Identity_Key", key } } };
        }

        public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
        {
            var key = GetKey(identity);
            var data = await GetFromAllSources<Dictionary<string, JsonValue>>(key);
            if (data == null)
            {
                return new Dictionary<string, JsonValue>();
            }
            return data;
        }

        private async Task<T> GetFromAllSources<T>(string key) where T:class
        {
            var bucket = GetOrOpenBucket();
            var document = await bucket.GetAsync<T>(key);
            if (document.Success) return document.Value;
            if (document.Status == global::Couchbase.IO.ResponseStatus.KeyNotFound) return null;
            var replica = (await bucket.GetFromReplicaAsync<T>(key));
            if (replica.Success) return replica.Value;
            if (replica.Status == global::Couchbase.IO.ResponseStatus.KeyNotFound) return null;
            throw new AggregateException(document.Exception ?? new Exception(document.Message),
                                          replica.Exception ?? new Exception(replica.Message));
        }

        public async Task RemoveIdentityContext(Identity identity)
        {
            await GetOrOpenBucket().RemoveAsync(GetKey(identity));
        }


    }
}

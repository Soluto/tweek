using FSharpUtils.Newtonsoft;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Tweek.ApiService.Addons;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using MongoDB.Driver;

namespace Tweek.Drivers.Context.MongoDb
{
    public class MongoDbDriver : IContextDriver
    {
        private JsonSerializerSettings JSON_SERIALIZER_SETTINGS = new JsonSerializerSettings { ContractResolver = new TweekContractResolver() };
        private const string TWEEK_DB_NAME = "tweek";
        public string GetKey(Identity identity) => identity.Id;

        public IMongoCollection<Dictionary<string, object>> GetCollection(Identity identity) =>
            _db.GetCollection<Dictionary<string, object>>("identity_" + identity.Type);

        private MongoClient _client;
        private IMongoDatabase  _db;

        public MongoDbDriver(string connectionString)
        {
            if ((connectionString ?? "") == "")
            {
                throw new ArgumentException("Missing MongoDB connection string", nameof(connectionString));
            }

            _client = new MongoClient(connectionString);
            _db = _client.GetDatabase(TWEEK_DB_NAME);
        }

        public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            var id = GetKey(identity);
            var collection = GetCollection(identity);
            var filter = Builders<Dictionary<string, object>>.Filter.Eq("_id", id);

            var existing = await (await collection.FindAsync(filter)).SingleOrDefaultAsync();
            if(existing == null) {
                var contextWithCreationDate = new Dictionary<string, object>(ToObjects(context))
                {
                    {"@CreationDate", DateTimeOffset.UtcNow.ToString("O")},
                    {"_id", id}
                };
                await collection.InsertOneAsync(contextWithCreationDate);
                return;
            }

            var update = Builders<Dictionary<string, object>>.Update.Set("_id", id);
            foreach (var item in context)
            {
                update = update.Set(item.Key, ConversionUtils.ConvertJsonValueToObject(item.Value));
            }
            await collection.FindOneAndUpdateAsync(filter, update);
        }

        public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
        {
            var id = GetKey(identity);
            var collection = GetCollection(identity);
            var filter = Builders<Dictionary<string, object>>.Filter.Eq("_id", id);
            var result = await (await collection.FindAsync(filter)).SingleOrDefaultAsync();
            return result == null ? new Dictionary<string, JsonValue>() : ConversionUtils.ToJsonValues(result);
        }

        public async Task RemoveFromContext(Identity identity, string key)
        {
            var id = GetKey(identity);
            var collection = GetCollection(identity);
            var filter = Builders<Dictionary<string, object>>.Filter.Eq("_id", id);
            var update = Builders<Dictionary<string, object>>.Update.Unset(key);
            await collection.FindOneAndUpdateAsync<Dictionary<string, object>>(filter, update);
        }

        public async Task DeleteContext(Identity identity)
        {
            var id = GetKey(identity);
            var collection = GetCollection(identity);
            var filter = Builders<Dictionary<string, object>>.Filter.Eq("_id", id);
            await collection.DeleteOneAsync(filter);
        }

        private static Dictionary<string, object> ToObjects(Dictionary<string, JsonValue> input)
        {
            var result = new Dictionary<string, object>(input.Count);
            foreach (var keyValuePair in input)
            {
                var key = keyValuePair.Key;
                var value = keyValuePair.Value;
                result.Add(key, ConversionUtils.ConvertJsonValueToObject(value));
            }
            
            return result;
        }

    }
}
using FSharpUtils.Newtonsoft;
using Newtonsoft.Json;
using MongoDB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Tweek.ApiService.Addons;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using MongoDB.Driver;
using MongoDB.Bson;

namespace Tweek.Drivers.Context.MongoDb
{
    public class MongoDbDriver : IContextDriver
    {
        private const string TWEEK_DB_NAME = "tweek";
        private const string TWEEK_COLLECTION_NAME = "tweek-contexts";
        private JsonSerializerSettings JSON_SERIALIZER_SETTINGS = new JsonSerializerSettings { ContractResolver = new TweekContractResolver() };
        public string GetKey(Identity identity) => "identity_" + identity.Type + "_" + identity.Id;
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
            var collection = _db.GetCollection<Dictionary<string, JsonValue>>(TWEEK_COLLECTION_NAME);
            var filter = Builders<Dictionary<string, JsonValue>>.Filter.Eq("_id", id);

            var existing = await (await collection.FindAsync(filter)).FirstAsync();
            if(existing == null) {
                var contextWithCreationDate = new Dictionary<string, JsonValue>(context);
                contextWithCreationDate.Add("@CreationDate", JsonValue.NewString(DateTimeOffset.UtcNow.ToString()));
                await collection.InsertOneAsync(contextWithCreationDate);
                return;
            }

            UpdateDefinition<Dictionary<string, JsonValue>> update = Builders<Dictionary<string, JsonValue>>.Update.Set("_id", id);
            foreach (var item in context)
            {
                update = update.Set(item.Key, item.Value);
            }
            await collection.FindOneAndUpdateAsync(value => value[id] != null, update);
        }

        public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
        {
            var id = GetKey(identity);
            var collection = _db.GetCollection<Dictionary<string, JsonValue>>(TWEEK_COLLECTION_NAME);
            var filter = Builders<Dictionary<string, JsonValue>>.Filter.Eq("_id", id);
            var result = await (await collection.FindAsync(filter)).SingleAsync();
            return result;
        }

        public async Task RemoveFromContext(Identity identity, string key)
        {
            var id = GetKey(identity);
            var collection = _db.GetCollection<Dictionary<string, JsonValue>>(TWEEK_COLLECTION_NAME);
            await collection.DeleteOneAsync(Builders<Dictionary<string, JsonValue>>.Filter.Eq("_id", id));
        }
    }
}
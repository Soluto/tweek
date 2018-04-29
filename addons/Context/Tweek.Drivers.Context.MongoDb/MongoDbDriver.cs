using FSharpUtils.Newtonsoft;
using Newtonsoft.Json;
using MongoDB;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Threading.Tasks;
using LanguageExt;
using Tweek.ApiService.Addons;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using Newtonsoft.Json.Linq;

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
                update = update.Set(item.Key, ConvertJsonValueToObject(item.Value));
            }
            await collection.FindOneAndUpdateAsync(filter, update);
        }

        public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
        {
            var id = GetKey(identity);
            var collection = GetCollection(identity);
            var filter = Builders<Dictionary<string, object>>.Filter.Eq("_id", id);
            var result = await (await collection.FindAsync(filter)).SingleOrDefaultAsync();
            return ToJsonValues(result);
        }

        public async Task RemoveFromContext(Identity identity, string key)
        {
            var id = GetKey(identity);
            var collection = GetCollection(identity);
            var filter = Builders<Dictionary<string, object>>.Filter.Eq("_id", id);
            var update = Builders<Dictionary<string, object>>.Update.Unset(key);
            await collection.FindOneAndUpdateAsync<Dictionary<string, object>>(filter, update);
        }

        private static Dictionary<string, object> ToObjects(Dictionary<string, JsonValue> input)
        {
            var result = new Dictionary<string, object>(input.Count);
            foreach (var keyValuePair in input)
            {
                var key = keyValuePair.Key;
                var value = keyValuePair.Value;
                result.Add(key, ConvertJsonValueToObject(value));
            }
            
            return result;
        }

        private static Dictionary<string, JsonValue> ToJsonValues(Dictionary<string, object> input)
        {
            var result = new Dictionary<string, JsonValue>(input.Count);
            foreach (var keyValuePair in input)
            {
                var key = keyValuePair.Key;
                if (key == "_id")
                {
                    continue;
                }
                var value = keyValuePair.Value;
                result.Add(key, ConvertObjectToJsonValue(value));
            }

            return result;
        }

        private static object ConvertJsonValueToObject(JsonValue value)
        {
            if (value.IsNull)
            {
                return null;
            }

            if (value.IsBoolean)
            {
                return value.AsBoolean();
            }

            if (value.IsFloat || value.IsNumber)
            {
                return value.AsDecimal();
            }
            
            if (value.IsString)
            {
                return value.AsString();
            }
            
            if (value.IsArray)
            {
                return value.AsArray().Select(ConvertJsonValueToObject).ToArray();
            }

            if (!value.IsRecord)
                throw new NotImplementedException($"There's not implementation for JsonValue tag {value.Tag}");
            
            var record = (JsonValue.Record) value;
            return record.properties.ToDictionary(kvPair => kvPair.Item1, kvPair => ConvertJsonValueToObject(kvPair.Item2));
        }

        private static JsonValue ConvertObjectToJsonValue(object value)
        {
            return IsNumeric(value) ? JsonValue.NewNumber((decimal)value) : JsonValue.From(JToken.FromObject(value));
        }

        private static bool IsNumeric(object value)
        {
            var type = value.GetType();
            return type == typeof(int) ||
                   type == typeof(long) ||
                   type == typeof(double) ||
                   type == typeof(decimal);
        }
    }
}
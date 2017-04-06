using Engine.Drivers.Context;
using Engine.DataTypes;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Collections.Immutable;
using System;
using FSharpUtils.Newtonsoft;
using LiteDB;
using Newtonsoft.Json;

namespace Tweek.Drivers.LiteDBDriver
{
    public class LiteDBDriver : IContextDriver
    {
        readonly string _collectionName;
        
        readonly string _dbFilePath;

        public LiteDBDriver(string collectionName, string dbFilePath)
        {
            _collectionName = collectionName;
            _dbFilePath = dbFilePath;
        }

        public string GetKey(Identity identity) => "identity_" + identity.Type + "_" + identity.Id;

        public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            using(var db = new LiteDatabase(_dbFilePath))
            {
                var collection = db.GetCollection(_collectionName);
                var id = GetKey(identity);
                var bsonContext = BsonFromJson(context, id);
                collection.Upsert(bsonContext);
            }
        }

        public async Task RemoveFromContext(Identity identity, string key)
        {
            using(var db = new LiteDatabase(_dbFilePath))
            {
                var collection = db.GetCollection(_collectionName);
                var id = GetKey(identity);
                var preContext = await GetContext(identity);
                preContext.Remove(key);
                collection.Upsert(BsonFromJson(preContext, id));
            }
        }

        public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
        {
            using(var db = new LiteDatabase(_dbFilePath))
            {
                var collection = db.GetCollection(_collectionName);
                var id = GetKey(identity);
                var bson = collection.FindById(new BsonValue(id));
                if (bson == null)
                {
                    return new Dictionary<string, JsonValue>();
                }
                return JsonFromBson(bson);
            }
        }

        private BsonDocument BsonFromJson(Dictionary<string, JsonValue> json, string id)
        {
            var jsonString = JsonConvert.SerializeObject(json);
            var bsonValue = new BsonValue(jsonString);
            var bsonId = new BsonValue(id);
            var dic = new Dictionary<string, BsonValue>{{"_id", bsonId}, {"value", bsonValue}};
            return new BsonDocument(dic);
        }

        private Dictionary<string, JsonValue> JsonFromBson(BsonDocument document)
        {
            var bson = document["value"];
            var bString = bson.ToString();
            var result = JsonConvert.DeserializeObject<Dictionary<string,JsonValue>>(bString);
            return result;
            // var testResult = JsonValue.Parse(bString);
            // return new Dictionary<string, JsonValue>{{"value", result}};
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using FSharpUtils.Newtonsoft;
using Newtonsoft.Json.Linq;

namespace Tweek.Drivers.Context.MongoDb
{
    public static class ConversionUtils
    {
        public static Dictionary<string, JsonValue> ToJsonValues(Dictionary<string, object> input)
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

        public static object ConvertJsonValueToObject(JsonValue value)
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

        public static JsonValue ConvertObjectToJsonValue(object value)
        {
            return IsNumeric(value) ? JsonValue.NewNumber((decimal)value) : JsonValue.From(JToken.FromObject(value));
        }

        public static bool IsNumeric(object value)
        {
            var type = value.GetType();
            return type == typeof(int) ||
                   type == typeof(long) ||
                   type == typeof(double) ||
                   type == typeof(decimal);
        }
    }
}
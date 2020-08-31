using System;
using System.Collections.Generic;
using System.Linq;
using FSharpUtils.Newtonsoft;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Reflection;

namespace Tweek.Utils
{
    public class JsonValueConverter : JsonConverter
    {
        public static JsonValueConverter Instance = new JsonValueConverter();
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            WriteJson(writer, (JsonValue) value);
        }

        private void WriteJson(JsonWriter writer, JsonValue value)
        {
            if (value is JsonValue.String)
            {
                writer.WriteValue(((JsonValue.String)value).Item);
            }
            else if (value is JsonValue.Number)
            {
                writer.WriteValue(((JsonValue.Number)value).Item);
            }
            else if (value is JsonValue.Float)
            {
                writer.WriteValue(((JsonValue.Float)value).Item);
            }
            else if (value is JsonValue.Boolean)
            {
                writer.WriteValue(((JsonValue.Boolean)value).Item);
            }
            else if (value is JsonValue.Array)
            {
                writer.WriteStartArray();
                var elements = ((JsonValue.Array) value).elements;
                foreach (var v in elements)
                {
                    WriteJson(writer, v);
                }
                writer.WriteEndArray();
            }
            else if (value is JsonValue.Record)
            {
                writer.WriteStartObject();
                var elements = ((JsonValue.Record)value).properties;
                foreach (var v in elements)
                {
                    writer.WritePropertyName(v.Item1);
                    WriteJson(writer, v.Item2);
                }
                writer.WriteEndObject();
            }
            else if (value == JsonValue.Null || value == null)
            {
                writer.WriteNull();
            }
        }

        private JsonValue ConvertToJSONValue(JToken token)
        {
            if (token.Type == JTokenType.Null)
            {
                return JsonValue.Null;
            }
            else if (token.Type == JTokenType.Float || token.Type == JTokenType.Integer)
            {
                return JsonValue.NewNumber(token.Value<decimal>());
            }
            else if (token.Type == JTokenType.Boolean)
            {
                return JsonValue.NewBoolean(token.Value<bool>());
            }
            else if (token.Type == JTokenType.String)
            {
                return JsonValue.NewString(token.Value<string>());
            }
            else if (token.Type == JTokenType.Array)
            {
                return JsonValue.NewArray(((JArray)token).Select(ConvertToJSONValue).ToArray());
            }
            else if (token.Type == JTokenType.Object)
            {
                return JsonValue.NewRecord( ((JObject)token).Properties().Select(x=>Tuple.Create(x.Name, ConvertToJSONValue(x.Value))).ToArray());
            }

            else if (token.Type == JTokenType.Date)
            {
                return JsonValue.NewString( token.Value<DateTime>().ToString("yyyy-MM-ddTHH:mm:ssZ"));
            }
            return null;
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            return ConvertToJSONValue(JToken.Load(reader));
        }

        public override bool CanConvert(Type objectType)
        {
            return typeof (JsonValue).GetTypeInfo().IsAssignableFrom(objectType.GetTypeInfo());
        }
    }
}
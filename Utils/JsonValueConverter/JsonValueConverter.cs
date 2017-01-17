using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using FSharp.Data;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace JsonValueConverter
{
    public class JsonValueConverter : JsonConverter
    {
        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            if (value is JsonValue)
            {
                WriteJson(writer, (JsonValue) value);
            }
            else
            {
                writer.WriteNull();
            }
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
            else
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
            else if (token.Type == JTokenType.Float)
            {
                return JsonValue.NewFloat(token.Value<float>());
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
            else
            {
                return JsonValue.Null;
            }
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            return ConvertToJSONValue(JToken.Load(reader));
        }

        public override bool CanConvert(Type objectType)
        {
            return objectType.IsAssignableFrom(typeof(JsonValue));
        }
    }
}
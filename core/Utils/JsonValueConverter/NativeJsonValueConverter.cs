using System;
using System.Collections.Generic;
using System.Linq;
using FSharpUtils.Newtonsoft;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace Tweek.Utils
{
    public class NativeJsonValueConverter : JsonConverter<JsonValue>
    {
        public override bool CanConvert(Type typeToConvert)
        {
            return typeof(JsonValue).IsAssignableFrom(typeToConvert);
        }

        public override JsonValue Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            switch (reader.TokenType)
            {
                case JsonTokenType.String:
                    return JsonValue.NewString(reader.GetString());
                case JsonTokenType.Number:
                    return JsonValue.NewNumber(reader.GetDecimal());
                case JsonTokenType.True:
                    return JsonValue.NewBoolean(true);
                case JsonTokenType.False:
                    return JsonValue.NewBoolean(false);
                case JsonTokenType.StartArray:
                    var elements = new List<JsonValue>();

                    while (reader.Read() && reader.TokenType != JsonTokenType.EndArray)
                    {
                        elements.Add(JsonSerializer.Deserialize<JsonValue>(ref reader, options));
                    }

                    return JsonValue.NewArray(elements.ToArray());
                case JsonTokenType.StartObject:
                    return JsonValue.NewRecord(JsonSerializer
                        .Deserialize<Dictionary<string, JsonValue>>(ref reader, options)
                        .Select(kvp => Tuple.Create(kvp.Key, kvp.Value)).ToArray());
                // This won't do anything until .NET 5, since nulls are skipped in JsonConverters.
                // More details: https://github.com/dotnet/runtime/issues/34439
                case JsonTokenType.Null:
                    return JsonValue.Null;
            }

            throw new JsonException($"Bad JsonTokenType. Expected String/Number/True/False/Null. Got ${reader.TokenType}");
        }

        public override void Write(Utf8JsonWriter writer, JsonValue value, JsonSerializerOptions options)
        {
            switch (value)
            {
                case JsonValue.String val:
                    writer.WriteStringValue(val.Item);
                    break;
                case JsonValue.Number val:
                    writer.WriteNumberValue(val.Item);
                    break;
                case JsonValue.Float val:
                    writer.WriteNumberValue(val.Item);
                    break;
                case JsonValue.Boolean val:
                    writer.WriteBooleanValue(val.Item);
                    break;
                case JsonValue.Array arr:
                    writer.WriteStartArray();
                    foreach (var val in arr.elements)
                    {
                        Write(writer, val, options);
                    }

                    writer.WriteEndArray();
                    break;
                case JsonValue.Record arr:
                    writer.WriteStartObject();
                    foreach (var (name, val) in arr.properties)
                    {
                        writer.WritePropertyName(name);
                        Write(writer, val, options);
                    }

                    writer.WriteEndObject();
                    break;
                default:
                    if (value == JsonValue.Null)
                        writer.WriteNullValue();
                    break;
            }
        }
    }
}
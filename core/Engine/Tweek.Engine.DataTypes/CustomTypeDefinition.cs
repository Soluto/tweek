using System;
using System.Text.RegularExpressions;
using FSharpUtils.Newtonsoft;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;

namespace Tweek.Engine.DataTypes
{
    public class CustomTypeDefinition 
    {
        [JsonProperty(Required = Required.Always)]
        public string Base { get; set; }

        public JsonValue[] AllowedValues { get; set; } = new JsonValue[]{};

        public string Comparer { get; set; }

        public Regex Validation { get; set; }

        public static CustomTypeDefinition FromJsonValue(JsonValue value ){
            var props = value.Properties().ToDictionary(x=>x.Item1, x=>x.Item2, StringComparer.InvariantCultureIgnoreCase);

            return new CustomTypeDefinition{
                Base = props["base"].AsString(),
                AllowedValues = props.ContainsKey("allowedValues") ? props["allowedValues"].AsArray() : new JsonValue[]{},
                Comparer = props.ContainsKey("comparer") ? props["comparer"].AsString() : null,
                Validation = props.ContainsKey("validation") ? new Regex(props["validation"].AsString()) : null
            };
        }
    }
}
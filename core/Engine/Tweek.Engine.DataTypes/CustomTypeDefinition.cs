using System;
using System.Text.RegularExpressions;
using FSharpUtils.Newtonsoft;
using Newtonsoft.Json;

namespace Tweek.Engine.DataTypes
{
    public class CustomTypeDefinition 
    {
        [JsonProperty(Required = Required.Always)]
        public string Base { get; set; }

        public JsonValue[] AllowedValues { get; set; } = new JsonValue[]{};

        public string Comparer { get; set; }

        public Regex Validation { get; set; }
    }
}
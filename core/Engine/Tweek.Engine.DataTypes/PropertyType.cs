using System;
using System.Text.RegularExpressions;
using Newtonsoft.Json;

namespace Tweek.Engine.DataTypes
{
    public class CustomTypeDefinition 
    {
        [JsonProperty(Required = Required.Always)]
        public string Base { get; set; }

        public string[] AllowedValues { get; set; } = new string[]{};

        public string Comparer { get; set; }

        public Regex Validation { get; set; }
    }
}
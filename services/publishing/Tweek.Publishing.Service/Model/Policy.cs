using System.Collections.Generic;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Tweek.Publishing.Service.Model
{
    public class PolicyRule {
        [JsonProperty("group")]
        public string Group;

        [JsonProperty("user")]
        public string User;

        [JsonProperty("contexts")]
        public Dictionary<string, string> Contexts;

        [JsonProperty("object")]
        public string Object;

        [JsonProperty("action")]
        public string Action;

        [JsonProperty("effect")]
        public string Effect;
    }

    public class Policy
    {
        [JsonProperty("policies")]
        public PolicyRule[] Rules;
    }
}
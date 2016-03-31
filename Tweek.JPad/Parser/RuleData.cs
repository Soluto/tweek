using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Engine.Rules.Creation
{
    public class RuleData
    {
        public string Id { get; set; }
        public string Type { get; set; }
        public JToken Matcher { get; set; }
        public string Value { get; set; }
        public Dictionary<DateTimeOffset, JToken> ValueDistribution { get; set; }
        public string OwnerType { get; set; }
    }
}
using System;
using System.Collections.Generic;

namespace Engine.Rules.Creation
{
    public class RuleData
    {
        public string Id { get; set; }
        public string Key { get; set; }
        public int Order { get; set; }
        public string Type { get; set; }
        public string MatcherSchema { get; set; }
        public string SingleVariant_Value { get; set; }
        public Dictionary<DateTimeOffset, string> MultiVariant_ValueDistributionSchema { get; set; }
        public string MultiVariant_OwnerType { get; set; }
    }
}
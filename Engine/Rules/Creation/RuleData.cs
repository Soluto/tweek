using System;
using System.Collections.Generic;

namespace Engine.Rules.Creation
{
    public class RuleData
    {
        public string Key;
        public int Order;
        public string Type;
        public string MatcherSchema;
        public string SingleVairant_Value;
        public Dictionary<DateTime, string> MultiVariant_ValueDistributionSchema;
        public string MultiVariant_OwnerType;
        public string MultiVariant_ExperimentId;
    }
}
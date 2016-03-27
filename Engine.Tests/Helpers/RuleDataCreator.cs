using System;
using System.Collections.Generic;
using System.Threading;
using Engine.Rules.Creation;

namespace Engine.Tests.Helpers
{
    public static class RuleDataCreator
    {
        private static int _order = 0;

        public static int Order{get { return Interlocked.Increment(ref _order);}}

        public static RuleData CreateSingleVariantRule(string key, string matcher,  string value, string ruleId = null)
        {
            return new RuleData() { Id = ruleId ?? Guid.NewGuid().ToString(), Order = Order, Key = key, MatcherSchema = matcher, SingleVariant_Value = value, Type = "SingleVariant" };
        }

        public static RuleData CreateMultiVariantRule(string key, string matcher, Dictionary<DateTimeOffset, string> valueDistrubtions, string ownerType, string ruleId = null)
        {
            return new RuleData() { Id = ruleId ?? Guid.NewGuid().ToString(), Order = Order, Key = key, MatcherSchema = matcher, MultiVariant_ValueDistributionSchema = valueDistrubtions, MultiVariant_OwnerType = ownerType, Type = "MultiVariant" };
        }
    }
}
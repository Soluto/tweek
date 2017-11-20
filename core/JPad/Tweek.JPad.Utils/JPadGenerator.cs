using FSharpUtils.Newtonsoft;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using Tweek.Engine.Drivers.Rules;
using Tweek.Utils;

namespace Tweek.JPad.Generator
{
    public class JPadGenerator
    {
        public static JPadGenerator New() => new JPadGenerator();

        private readonly object[] _rules;

        private JPadGenerator(params object[] rules)
        {
            _rules = rules;
        }

        public JPadGenerator AddSingleVariantRule(string matcher, string value, string ruleId = null)
            => AddSingleVariantRule(matcher, JsonValue.NewString(value), ruleId);

        public JPadGenerator AddSingleVariantRule(string matcher, bool value, string ruleId = null)
            => AddSingleVariantRule(matcher, JsonValue.NewBoolean(value), ruleId);

        public JPadGenerator AddSingleVariantRule(string matcher, decimal number, string ruleId = null)
            => AddSingleVariantRule(matcher, JsonValue.NewNumber(number), ruleId);

        public JPadGenerator AddSingleVariantRule(string matcher, JsonValue value, string ruleId = null)
            => AddRule(new 
                {
                    Id = ruleId ?? Guid.NewGuid().ToString(),
                    Matcher = JToken.Parse(matcher),
                    Value = value,
                    Type = "SingleVariant"
                });

        public JPadGenerator AddMultiVariantRule(string matcher, Dictionary<DateTimeOffset, string> valueDistrubtions, string ownerType, string ruleId = null)
            => AddRule(new 
            {
                Id = ruleId ?? Guid.NewGuid().ToString(),
                Matcher = JToken.Parse(matcher),
                ValueDistribution = valueDistrubtions.ToDictionary(x=>x.Key, x=>JToken.Parse(x.Value)),
                OwnerType = ownerType,
                Type = "MultiVariant"
            });
        public JPadGenerator AddMultiVariantRule(string matcher, string valueDistrubtions, string ownerType, string ruleId = null)
            => AddRule(new
            {
                Id = ruleId ?? Guid.NewGuid().ToString(),
                Matcher = JToken.Parse(matcher),
                ValueDistribution = JToken.Parse(valueDistrubtions),
                OwnerType = ownerType,
                Type = "MultiVariant"
            });

        
        private JPadGenerator AddRule(object rule) => new JPadGenerator(_rules.Concat(new [] {rule}).ToArray());        

        public RuleDefinition Generate() => new RuleDefinition() { Format = "jpad", Payload = JsonConvert.SerializeObject(_rules, Formatting.Indented, new JsonValueConverter()) };
    }
}

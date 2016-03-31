using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Engine.Drivers.Rules;
using Engine.Rules.Creation;
using Newtonsoft.Json;

namespace Tweek.JPad.Generator
{
    public class JPadGenerator
    {
        public static JPadGenerator New() => new JPadGenerator();

        private readonly RuleData[] _rules;

        private JPadGenerator(params RuleData[] rules)
        {
            _rules = rules;
        }

        public JPadGenerator AddSingleVariantRule(string matcher, string value, string ruleId = null)
            => AddRule(new RuleData()
                {
                    Id = ruleId ?? Guid.NewGuid().ToString(),
                    MatcherSchema = matcher,
                    SingleVariant_Value = value,
                    Type = "SingleVariant"
                });

        public JPadGenerator AddMultiVariantRule(string matcher, Dictionary<DateTimeOffset, string> valueDistrubtions, string ownerType, string ruleId = null)
            => AddRule(new RuleData()
            {
                Id = ruleId ?? Guid.NewGuid().ToString(),
                MatcherSchema = matcher,
                MultiVariant_ValueDistributionSchema = valueDistrubtions,
                MultiVariant_OwnerType = ownerType,
                Type = "MultiVariant"
            });
        
        private JPadGenerator AddRule(RuleData rule) => new JPadGenerator(_rules.Concat(new [] {rule}).ToArray());        

        public RuleDefinition Generate() => new RuleDefinition() { Format = "jpad", Payload = JsonConvert.SerializeObject(_rules) };
    }
}

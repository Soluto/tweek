using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reactive;
using System.Text;
using System.Threading.Tasks;
using Engine.Core.Rules;
using Engine.Drivers.Rules;
using Engine.Rules.Matcher;
using Engine.Rules.ValueDistribution;

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

    public enum RulesUpdate
    {
        Default
    }

    static class RuleDataParsing
    {
        internal static IRule ParseRule(RuleData data,
            MatcherParser matcherParser, 
            ValueDistributorParser valueDistributorParser)
        {
            var matcher = matcherParser(data.MatcherSchema);
            if (data.Type == "SingleVariant")
            {
                return new SingleVariantRule()
                {
                    Matcher = matcher,
                    Value = new ConfigurationValue(data.SingleVairant_Value)
                };
            }

            if (data.Type == "MultiVariant")
            {
                
                var valueDistributors = new SortedList<DateTime, ValueDistributor>(
                    data.MultiVariant_ValueDistributionSchema.ToDictionary(x=>x.Key, x=>valueDistributorParser(x.Value)));

                return new MultiVariantRule()
                {
                    OwnerType = data.MultiVariant_OwnerType,
                    ExperimentId = data.MultiVariant_ExperimentId,
                    Matcher = matcher,
                    ValueDistubtors = valueDistributors
                };
            }
            throw new Exception("no parser for rule type");
        }
    }


    public static class RulesRetrieverCreator
    {
        public static async Task<RulesRepository> Create(IRulesDriver driver)
        {
           

            var allRules = (await driver.GetRules())
                                  .OrderBy(x=>x.Key)
                                  .ThenBy(x=>x.Order)
                                  .Select(x=> new {x.Key,Rule = 
                                      RuleDataParsing.ParseRule(x, 
                                      Matcher.Creation.Parser,
                                      ValueDistribution.Creation.Parser)});
            
            return (ConfigurationPath key) =>
            {
                return allRules.Where(x => x.Key == key).Select(x=>x.Rule).ToList();
            };
        }
    }
}

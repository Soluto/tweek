using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.Core;
using Engine.Core.DataTypes;
using Engine.Core.Rules;
using Engine.Drivers.Rules;
using Engine.Rules.Matcher;
using Engine.Rules.ValueDistribution;

namespace Engine.Rules.Creation
{
    static class RuleDataParsing
    {
        internal static IRule ParseRule(RuleData data,
            MatcherParser matcherParser, 
            ValueDistributorParser valueDistributorParser)
        {
            var matcher = matcherParser(data.MatcherSchema);

            if (data.Type == "SingleVariant")
            {
                return new SingleVariantRule
                {
                    Matcher = matcher,
                    Value = new ConfigurationValue(data.SingleVairant_Value)
                };
            }

            if (data.Type == "MultiVariant")
            {
                
                var valueDistributors = new SortedList<DateTime, ValueDistributor>(
                    data.MultiVariant_ValueDistributionSchema.ToDictionary(x=>x.Key, x=>valueDistributorParser(x.Value)));

                return new MultiVariantRule
                {
                    OwnerType = data.MultiVariant_OwnerType,
                    ExperimentId = data.MultiVariant_ExperimentId,
                    Matcher = matcher,
                    ValueDistributors = valueDistributors
                };
            }
            throw new Exception("no parser for rule type");
        }
    }


    public static class RulesRetrieverCreator
    {
        private struct Indexed<T>
        {
            private readonly T _value;
            private readonly int _index;
            public Indexed(T value, int index)
            {
                _value = value;
                _index = index ;
            }
            public T Value { get { return _value; }}
            public int Index { get { return _index; } }
        }

        private static Indexed<T> IndexWith<T>(this T value, int index)
        {
            return new Indexed<T>(value, index);
        }

        private static async Task<ILookup<string, Indexed<IRule>>> LoadRules(IRulesDriver driver)
        {
            return (await driver.GetRules())
                        .OrderBy(x => x.Key)
                        .ThenBy(x => x.Order)
                        .ToLookup(x => x.Key, x => RuleDataParsing.ParseRule(x,
                                Matcher.Creation.Parser,
                                ValueDistribution.Creation.Parser).IndexWith(x.Order));

        }
        public static async Task<RulesRepository> Create(IRulesDriver driver)
        {
            var allRules = await LoadRules(driver);
            
            return (ConfigurationPath key) => allRules[key]
                                             .OrderBy(x=>x.Index)
                                             .Select(x=>x.Value)
                                             .ToList();
        }
    }
}

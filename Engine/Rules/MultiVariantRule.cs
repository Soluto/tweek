using System;
using System.Collections.Generic;
using System.Linq;
using Engine.Core.Context;
using Engine.Core.DataTypes;
using Engine.Core.Rules;
using Engine.Rules.ValueDistribution;
using LanguageExt;

namespace Engine.Rules
{
    public class MultiVariantRule : IRule
    {
        public string ExperimentId;
        public Matcher.Matcher Matcher;

        public SortedList<DateTime, ValueDistributor> ValueDistributors;
        public string OwnerType;

        public Option<ConfigurationValue> GetValue(GetContextValue fullContext)
        {
            return fullContext(OwnerType + ".@CreationDate")
                .Map(DateTime.Parse)
                .Bind(creationDate =>
                {
                    if ( Matcher(fullContext) )
                    {
                        var valueDistributor = ValueDistributors.Reverse().First(x => x.Key <= creationDate).Value;
                        return valueDistributor(ExperimentId, fullContext(OwnerType + ".@@id"));
                    }
                    return Option<ConfigurationValue>.None; 
                });


        }
    }
}
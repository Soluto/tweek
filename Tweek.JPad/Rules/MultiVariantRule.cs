using System;
using System.Collections.Generic;
using System.Linq;
using Engine.Core.Context;
using Engine.Core.Rules;
using Engine.Core.Utils;
using Engine.DataTypes;
using LanguageExt;

namespace Tweek.JPad.Rules
{
    public class MultiVariantRule : IRule
    {
        public string ExperimentId;
        public Matcher Matcher;

        public SortedList<DateTimeOffset, ValueDistributor> ValueDistributors;
        public string OwnerType;

        public Option<ConfigurationValue> GetValue(GetContextValue fullContext)
        {
            return fullContext(OwnerType + ".@CreationDate")
                .Map(DateTime.Parse)
                .Bind(creationDate =>
                {
                    if ( Matcher(fullContext) )
                    {
                        return ValueDistributors.Reverse()
                            .Where(x => x.Key <= creationDate)
                            .FirstOrNone()
                            .Map(valueDistributor=> valueDistributor.Value(ExperimentId, fullContext(OwnerType + ".@@id")));
                    }
                    return Option<ConfigurationValue>.None; 
                });


        }
    }
}
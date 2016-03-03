using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.Context;
using Engine.Core.Context;
using Engine.Core.Rules;
using Engine.Rules.Matcher;
using Engine.Rules.ValueDistribution;
using LanguageExt;
using LanguageExt.SomeHelp;

namespace Engine
{
    public class MultiVariantRule : IRule
    {
        public string ExperimentId;
        public Matcher Matcher;

        public SortedList<DateTime, ValueDistributor> ValueDistubtors;
        public string OwnerType;

        public Option<ConfigurationValue> GetValue(GetContextValue fullContext)
        {
            return fullContext(OwnerType + ":@CreationDate")
                .Map(DateTime.Parse)
                .Bind((creationDate) =>
                {
                    return (Matcher(fullContext))
                        ? ValueDistubtors.First(x => x.Key <= creationDate)
                            .Value(ExperimentId, fullContext(OwnerType + ":@@id"))
                            .ToSome()
                        : Option<ConfigurationValue>.None;
                });


        }
    }
}
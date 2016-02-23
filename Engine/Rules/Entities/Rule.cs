using System.Collections.Generic;
using System.Threading.Tasks;
using Engine.Context;
using Engine.Rules.Matcher;
using Engine.Rules.ValueDistribution;
using LanguageExt;

namespace Engine
{
    public interface IRule
    {
        Task<Option<ConfigurationValue>> GetValue( ContextRetrieverByIdentityType retrieverByIdentityType);
    }

    public class Rule : IRule
    {
        private Matcher Matcher;
        private ConfigurationValue Value;
        public async Task<Option<ConfigurationValue>> GetValue(ContextRetrieverByIdentityType retrieverByIdentityType)
        {
            return (await Matcher(retrieverByIdentityType)) ? Value : Option<ConfigurationValue>.None;
        }
    }

    public class Experiment : IRule
    {
        private int ExperimentId;
        private Matcher Matcher;
        private string CalculateByIdentity;
        private ValueDistributor ValueDistubtor;
        private ConfigurationValue Value;

        public async Task<Option<ConfigurationValue>> GetValue(ContextRetrieverByIdentityType retrieverByIdentityType)
        {
            return (await Matcher(retrieverByIdentityType)) ? 
                ValueDistubtor(ExperimentId, CalculateByIdentity)
                : Option<ConfigurationValue>.None;
        }
    }
}
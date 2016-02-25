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
        Task<Option<ConfigurationValue>> GetValue( GetLoadedContextByIdentityType byIdentityType);
    }

    public class Rule : IRule
    {
        private Matcher Matcher;
        private ConfigurationValue Value;
        public async Task<Option<ConfigurationValue>> GetValue(GetLoadedContextByIdentityType byIdentityType)
        {
            return (await Matcher(byIdentityType)) ? Value : Option<ConfigurationValue>.None;
        }
    }

    public class Experiment : IRule
    {
        private int ExperimentId;
        private Matcher Matcher;
        private string CalculateByIdentity;
        private ValueDistributor ValueDistubtor;
        private ConfigurationValue Value;

        public async Task<Option<ConfigurationValue>> GetValue(GetLoadedContextByIdentityType byIdentityType)
        {
            return (await Matcher(byIdentityType)) ? 
                ValueDistubtor(ExperimentId, CalculateByIdentity)
                : Option<ConfigurationValue>.None;
        }
    }
}
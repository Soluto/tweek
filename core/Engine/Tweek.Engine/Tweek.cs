using System.Threading.Tasks;
using Tweek.Engine.Drivers.Rules;
using Tweek.Engine.Rules.Creation;

namespace Tweek.Engine
{
    public static class Tweek
    {
        public static async Task<ITweek> Create(IRulesRepository rulesRepository, GetRuleParser parserResolver)
        {
            var rulesLoader = await RulesLoader.Factory(rulesRepository, parserResolver);
            return new TweekRunner(rulesLoader);
        }
    }
}
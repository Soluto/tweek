using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.Core;
using Engine.Core.Rules;
using Engine.DataTypes;
using Engine.Drivers.Rules;
using Tweek.JPad;

namespace Engine.Rules.Creation
{
    public static class RulesLoader
    {      
        public static async Task<Func<IReadOnlyDictionary<string, IRule>>> Factory(IRulesDriver driver, IRuleParser parser)
        {
            return Factory(await Create(driver, parser), driver, parser);
        }

        public static Func<IReadOnlyDictionary<string, IRule>> Factory(IReadOnlyDictionary<string, IRule> instance, IRulesDriver driver, IRuleParser parser)
        {
            var scopedInstance = instance;
            driver.OnRulesChange += ()=>Task.Run(() => Create(driver, parser)).ContinueWith(x => scopedInstance = x.Result);
            return () => scopedInstance;
        }

        public static async Task<IReadOnlyDictionary<string,IRule>> Create(IRulesDriver driver, IRuleParser parser)
        {
            IReadOnlyDictionary<string, IRule> allRules = (await driver.GetAllRules())
                .ToDictionary(x=>x.Key, x=> parser.Parse(x.Value.Payload));

            return allRules;
        }
    }
}

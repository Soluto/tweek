using System;
using System.Threading.Tasks;
using Engine.Context;
using Engine.Drivers.Context;
using Engine.Drivers.Rules;
using Engine.Rules.Creation;
using Engine.Core.Rules;
using Tweek.JPad;
using Engine.Core.Context;
using Engine.DataTypes;
using LanguageExt;
using static LanguageExt.Prelude;
using System.Collections.Generic;
using Tweek.JPad.Utils;

namespace Engine.Tests.TestDrivers
{
    public class TestScope
    {
        private readonly Func<Task> _dispose;
        private readonly IRulesDriver _rulesDriver;
        private readonly IContextDriver _contextDriver;
        private readonly Func<Task> _init;

        public TestScope(IRulesDriver rules, IContextDriver context, Func<Task> init, Func<Task> dispose)
        {
            _rulesDriver = rules;
            _contextDriver = context;
            _init = init;
            _dispose = dispose;
        }

        public async Task Run(Func<ITweek, Task> test)
        {
            Exception e = null;
            try
            {
                
                await _init();
                var parserSettings = new ParserSettings(new Dictionary<string, ComparerDelegate>());
                var tweek = await Tweek.Create(_contextDriver, _rulesDriver, JPadRulesParserAdapter.Convert(new JPadParser(parserSettings)));
                await test(tweek);
            }
            catch (Exception ex)
            {
                e = ex;
            }
            await _dispose();
            if (e != null) throw e;
        }
    }
}
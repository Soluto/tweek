using System;
using System.Threading.Tasks;
using Engine.Drivers.Context;
using Engine.Drivers.Rules;
using Tweek.JPad;
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
                var tweek = await Tweek.Create(_contextDriver, _rulesDriver, JPadRulesParserAdapter.Convert(new JPad2Parser(parserSettings)));
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
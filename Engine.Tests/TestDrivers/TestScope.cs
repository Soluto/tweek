using System;
using System.Threading.Tasks;
using Engine.Context;
using Engine.Keys;
using Engine.Rules.Creation;

namespace Engine.Tests.TestDrivers
{
    public class TestScope
    {
        private readonly Func<Task> _dispose;
        private readonly ITestDriver _driver;
        private readonly Func<Task> _init;

        public TestScope(ITestDriver driver ,Func<Task> init, Func<Task> dispose)
        {
            _driver = driver;
            _init = init;
            _dispose = dispose;
        }

        public async Task Run(Func<ITweek, Task> test)
        {
            Exception e = null;
            try
            {
                await _init();
                var tweek = new Tweek(ContextByIdentityCreation.FromDriver(_driver.Context),
                    await PathTraversalCreation.Create(_driver.Keys),
                    await RulesRetrieverCreator.Create(_driver.Rules));
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
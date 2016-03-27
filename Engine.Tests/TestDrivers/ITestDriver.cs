using System.Collections.Generic;
using Engine.DataTypes;
using Engine.Drivers.Context;
using Engine.Drivers.Keys;
using Engine.Drivers.Rules;
using Engine.Rules.Creation;

namespace Engine.Tests.TestDrivers
{
    public interface ITestDriver
    {
        IKeysDriver Keys { get; }
        IContextDriver Context { get; }
        IRulesDriver Rules { get; }
        TestScope SetTestEnviornment(Dictionary<Identity, Dictionary<string, string>> contexts, string[] keys, RuleData[] rules);
    }
}
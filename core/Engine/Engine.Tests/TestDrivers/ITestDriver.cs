using System.Collections.Generic;
using Engine.DataTypes;
using Engine.Drivers.Context;
using Engine.Drivers.Rules;
using Engine.Rules.Creation;
using FSharpUtils.Newtonsoft;

namespace Engine.Tests.TestDrivers
{
    public interface ITestDriver
    {
        IContextDriver Context { get; }
        TestScope SetTestEnviornment(Dictionary<Identity, Dictionary<string, JsonValue>> contexts, string[] keys, Dictionary<string,RuleDefinition> rules);
    }
}
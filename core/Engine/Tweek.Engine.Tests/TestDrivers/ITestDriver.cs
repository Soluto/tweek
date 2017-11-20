using Engine.DataTypes;
using Engine.Drivers.Context;
using Engine.Drivers.Rules;
using FSharpUtils.Newtonsoft;
using System.Collections.Generic;

namespace Engine.Tests.TestDrivers
{
    public interface ITestDriver
    {
        IContextDriver Context { get; }
        TestScope SetTestEnviornment(Dictionary<Identity, Dictionary<string, JsonValue>> contexts, string[] keys, Dictionary<string,RuleDefinition> rules);
    }
}
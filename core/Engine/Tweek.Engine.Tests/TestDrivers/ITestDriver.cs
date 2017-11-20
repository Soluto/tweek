using FSharpUtils.Newtonsoft;
using System.Collections.Generic;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using Tweek.Engine.Drivers.Rules;

namespace Tweek.Engine.Tests.TestDrivers
{
    public interface ITestDriver
    {
        IContextDriver Context { get; }
        TestScope SetTestEnviornment(Dictionary<Identity, Dictionary<string, JsonValue>> contexts, string[] keys, Dictionary<string,RuleDefinition> rules);
    }
}
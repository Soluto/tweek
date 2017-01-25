using System.Collections.Generic;
using FSharpUtils.Newtonsoft;
using static FSharpUtils.Newtonsoft.JsonValue;

namespace Tweek.ApiService.SmokeTests.GetConfigurations.Models
{
    public class TestContext
    {
        public string TestName { get; set; }
        public string KeyName { get; set; }
        public string ExpectedValue { get; set; }
        public Dictionary<string, JsonValue> Context { get; set; } = new Dictionary<string, JsonValue>();

        public override string ToString()
        {
            return TestName;
        }
    }
}

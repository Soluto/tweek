using System.Collections.Generic;

namespace Tweek.ApiService.SmokeTests.GetConfigurations.Models
{
    public class TestContext
    {
        public string TestName { get; set; }
        public string KeyName { get; set; }
        public string ExpectedValue { get; set; }
        public Dictionary<string, string> Context { get; set; } = new Dictionary<string, string>();

        public override string ToString()
        {
            return TestName;
        }
    }
}

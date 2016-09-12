using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tweek.ApiService.Tests.Models
{
    public class TestContext
    {
        public TestContext()
        {
            Context = new Dictionary<string, string>();
        }

        public string TestName { get; set; }
        public string KeyName { get; set; }
        public string ExpectedValue { get; set; }
        public Dictionary<string, string> Context { get; set; }
    }
}

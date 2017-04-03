using FSharpUtils.Newtonsoft;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using static FSharpUtils.Newtonsoft.JsonValue;

namespace Tweek.ApiService.SmokeTests.AppendContext
{
    public class AppendContextTests
    {
        private readonly ITweekApi mTweekApi;

        public AppendContextTests()
        {
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient();
        }


        [Fact(DisplayName = "Appending context with fixed configuration")]
        public async Task AppendContextWithFixedConfiguration()
        {
            var guid = Guid.NewGuid().ToString();
            await mTweekApi.AppendContext("test", "append-context-test-1", new Dictionary<string, FSharpUtils.Newtonsoft.JsonValue>()
            {
                ["@fixed:tests/fixed/some_fixed_configuration"] = NewString(guid.ToString())
            });
            var results = await mTweekApi.GetConfigurations("tests/fixed/some_fixed_configuration", new Dictionary<string, string>()
            {
                ["test"] = "append-context-test-1"
            });
            Assert.Equal(guid, results.ToString());
        }
    }
}

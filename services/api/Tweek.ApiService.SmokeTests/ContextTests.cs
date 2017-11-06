using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Xunit;
using Xunit.Abstractions;
using static FSharpUtils.Newtonsoft.JsonValue;

namespace Tweek.ApiService.SmokeTests
{
    public class ContextTests
    {
        private readonly ITweekApi mTweekApi;

        public ContextTests(ITestOutputHelper output)
        {
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient(output);
        }
        

        [Fact(DisplayName = "Appending context (insert/upsert) with fixed configuration works properly")]
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
            var additonalGuid = Guid.NewGuid().ToString();
            await mTweekApi.AppendContext("test", "append-context-test-1", new Dictionary<string, FSharpUtils.Newtonsoft.JsonValue>()
            {
                ["@fixed:tests/fixed/additional_fixed_configuration1"] = NewString(additonalGuid),
                ["@fixed:tests/fixed/additional_fixed_configuration2"] = NewString(additonalGuid)
            });

            results = await mTweekApi.GetConfigurations("tests/fixed/_", new Dictionary<string, string>()
            {
                ["test"] = "append-context-test-1"
            });
            
            Assert.Equal(additonalGuid, results["additional_fixed_configuration1"].ToString());
            Assert.Equal(additonalGuid, results["additional_fixed_configuration2"].ToString());
            Assert.Equal(guid, results["some_fixed_configuration"].ToString());
        }
        
        [Fact(DisplayName = "Deleting fixed configuration")]
        public async Task DeleteContextWithFixedConfiguration()
        {
            var guid = Guid.NewGuid().ToString();
            await mTweekApi.AppendContext("test", "delete-context-test-1", new Dictionary<string, FSharpUtils.Newtonsoft.JsonValue>()
            {
                ["@fixed:tests/fixed/some_fixed_configuration_delete"] = NewString(guid.ToString())
            });

            var results = await mTweekApi.GetConfigurations("tests/fixed/some_fixed_configuration_delete", new Dictionary<string, string>()
            {
                ["test"] = "delete-context-test-1"
            });
            Assert.Equal(guid, results.ToString());

            await mTweekApi.RemoveFromContext("test", "delete-context-test-1",
                "@fixed:tests/fixed/some_fixed_configuration_delete");

            results = await mTweekApi.GetConfigurations("tests/fixed/some_fixed_configuration_delete", new Dictionary<string, string>()
            {
                ["test"] = "delete-context-test-1"
            });
            
            Assert.Equal(JTokenType.Null, results.Type);
        }
    }
}

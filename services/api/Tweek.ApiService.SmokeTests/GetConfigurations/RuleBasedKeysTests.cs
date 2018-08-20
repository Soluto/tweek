using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FSharpUtils.Newtonsoft;
using LanguageExt;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Tweek.ApiService.SmokeTests.GetConfigurations.Models;
using Tweek.Utils;
using Xunit;
using Xunit.Abstractions;

namespace Tweek.ApiService.SmokeTests.GetConfigurations
{
    public class RuleBasedKeysTests
    {
        private readonly ITweekApi mTweekApi;

        public RuleBasedKeysTests(ITestOutputHelper output)
        {
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient(output);
        }

        [Theory(DisplayName = "Get key with simple rules")]
        [InlineData("Android", "android result")]
        [InlineData("iOS", "ios result")]
        [InlineData("Unknown", "default result")]
        public async Task GetSingleKey_BySimpleRules_ShouldReturnMatchingKeyValue(string osType, string expectedResult)
        {
            // Act
            var response = await mTweekApi.GetConfigurations("smoke_tests/rule_based_keys/simple", new Dictionary<string, string> { { "device.DeviceOsType", osType } });

            // Assert
            Assert.Equal(JTokenType.String, response.Type);
            Assert.Equal(expectedResult, response.ToString());
        }


        [Theory(DisplayName = "Get key with rules using comparison operators")]
        [MemberData("COMPARISON_OPERATORS_TEST_CONTEXTS", MemberType = typeof(RulesBasedTestsContextProvider))]
        public async Task RulesBasedKey_WithComparisonOperators_ShouldReturnMatchingKeyValue(TestContext testContext)
        {
            await RunContextBasedTest(testContext);
        }

        [Theory(DisplayName = "Get key with rules using in operator")]
        [MemberData("IN_OPERATOR_TEST_CONTEXTS", MemberType = typeof(RulesBasedTestsContextProvider))]
        public async Task RulesBasedKey_WithInOperator_ShouldReturnMatchingKeyValue(TestContext testContext)
        {
            await RunContextBasedTest(testContext);
        }

        [Theory(DisplayName = "Get key with rules using multiple fields")]
        [MemberData("MULTI_CONDITIONS_TEST_CONTEXTS", MemberType = typeof(RulesBasedTestsContextProvider))]
        public async Task RulesBasedKey_UsingMultipleFields_ShouldReturnMatchingKeyValue(TestContext testContext)
        {
            await RunContextBasedTest(testContext);
        }

        [Theory(DisplayName = "Get key with rules using array contains")]
        [MemberData("ARRAY_CONTAINS_TEST_CONTEXTS", MemberType = typeof(RulesBasedTestsContextProvider))]
        public async Task RulesBasedKey_UsingArrayContains_ShouldReturnMatchingKeyValue(TestContext testContext)
        {
            await RunContextBasedTest(testContext);
        }

        private async Task RunContextBasedTest(TestContext context)
        {
            var configContext = context.Context.SelectMany(x=>
            x.Value.IsArray ? x.Value.AsArray().Select(y=>KeyValuePair.Create(x.Key, y.AsString())) :
            Seq.create(KeyValuePair.Create(x.Key, x.Value.AsString())));

            // Act
            var response = await mTweekApi.GetConfigurations(context.KeyName, configContext);
            
            // Assert
            Assert.Equal(JTokenType.String, response.Type);
            Assert.Equal(context.ExpectedValue, response.ToString());
        }
    }
}

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Tweek.ApiService.SmokeTests.GetConfigurations.Models;
using Xunit;
using Xunit.Abstractions;

namespace Tweek.ApiService.SmokeTests.GetConfigurations
{
    public class RuleBasedKeysTests
    {
        private readonly ITestOutputHelper mOutput;
        private readonly ITweekApi mTweekApi;

        public RuleBasedKeysTests(ITestOutputHelper output)
        {
            mOutput = output;
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient();
        }

        [Theory(DisplayName = "Get key with simple rules")]
        [InlineData("Android", "android result")]
        [InlineData("iOS", "ios result")]
        [InlineData("Unknown", "default result")]
        public async Task GetSingleKey_BySimpleRules_ShouldReturnMatchingKeyValue(string osType, string expectedResult)
        {
            // Act
            var response = await mTweekApi.GetConfigurations("@tests/rules/simple", new Dictionary<string, string> { { "device.DeviceOsType", osType } });

            // Assert
            Assert.Equal(JTokenType.String, response.Type);
            Assert.Equal(expectedResult, response.ToString());
        }


        [Theory(DisplayName = "Get key with rules using comparison operators")]
        [MemberData("COMPARISON_OPERATORS_TEST_CONTEXTS", MemberType = typeof(TestContextProvider))]
        public async Task RulesBasedKey_WithComparisonOperators_ShouldReturnMatchingKeyValue(TestContext testContext)
        {
            await RunContextBasedTest(testContext);
        }

        [Theory(DisplayName = "Get key with rules using in operator")]
        [MemberData("IN_OPERATOR_TEST_CONTEXTS", MemberType = typeof(TestContextProvider))]
        public async Task RulesBasedKey_WithInOperator_ShouldReturnMatchingKeyValue(TestContext testContext)
        {
            await RunContextBasedTest(testContext);
        }

        [Theory(DisplayName = "Get key with rules using multiple fields")]
        [MemberData("MULTI_CONDITIONS_TEST_CONTEXTS", MemberType = typeof(TestContextProvider))]
        public async Task RulesBasedKey_UsingMultipleFields_ShouldReturnMatchingKeyValue(TestContext testContext)
        {
            await RunContextBasedTest(testContext);
        }

        private async Task RunContextBasedTest(TestContext context)
        {
            // Arrange
            mOutput.WriteLine(context.TestName);

            // Act
            var response = await mTweekApi.GetConfigurations(context.KeyName, context.Context);

            // Assert
            Assert.Equal(JTokenType.String, response.Type);
            Assert.Equal(context.ExpectedValue, response.ToString());
        }
    }
}

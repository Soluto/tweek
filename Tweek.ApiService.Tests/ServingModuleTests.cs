using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using RestEase;
using Xunit;
using Xunit.Abstractions;
using Tweek.ApiService.Tests.Models;
using Xunit.Extensions;

namespace Tweek.ApiService.Tests
{
    public class ServingModuleTests : IClassFixture<TestContextProvider>
    {
        private readonly ITestOutputHelper mOutput;
        private readonly Dictionary<string, string> mEmptyContext;
        private readonly IConfigurationsApi mConfigurationsApi;

        private TestContextProvider mTestContextProvider;

        public ServingModuleTests(ITestOutputHelper output, TestContextProvider testContextProvider)
        {
            mOutput = output;
            mTestContextProvider = testContextProvider;

            var targetBaseUrl = Environment.GetEnvironmentVariable("TWEEK_SMOKE_TARGET");

            if (string.IsNullOrEmpty(targetBaseUrl))
            {
                throw new ArgumentException("Missing smoke tests target environment variable, make sure you set up 'TWEEK_SMOKE_TARGET' to the target hostname.");
            }

            mConfigurationsApi = RestClient.For<IConfigurationsApi>(targetBaseUrl);
            mEmptyContext = new Dictionary<string, string>();
        }

        [Fact]
        public async Task GetSingleKey_NoRules_ShouldReturnDefaultKeyValue()
        {
            // Act
            var response = await mConfigurationsApi.Get("@tests/simple", mEmptyContext);

            // Assert
            Assert.Equal(JTokenType.String, response.Type);
            Assert.Equal("test", response.ToString());
        }

        [Fact]
        public async Task GetKeyTree_NoRules_ShouldReturnObjectWithDefaultValuesForAllKeys()
        {
            // Act
            var response = await mConfigurationsApi.Get("@tests/nested/_", mEmptyContext);

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            Assert.Equal("test", response.Value<string>("key1"));
            Assert.Equal("test", response.Value<string>("key2"));
        }

        [Theory]
        [InlineData("Android", "android result")]
        [InlineData("iOS", "ios result")]
        [InlineData("Unknown", "default result")]
        public async Task GetSingleKey_BySimpleRules_ShouldReturnMatchingKeyValue(string osType, string expectedResult)
        {
            // Act
            var response = await mConfigurationsApi.Get("@tests/rules/simple", new Dictionary<string, string> { { "device.DeviceOsType", osType } });

            // Assert
            Assert.Equal(JTokenType.String, response.Type);
            Assert.Equal(expectedResult, response.ToString());
        }

        [Fact]
        public async Task GetSingleKey_WithBernoulliTrialValues_ShouldReturnResultToSome()
        {
            // Arrange
            const double probablityOfTestFailure = 0.001;
            const double configurationKeyBernoulliTrialSplit = 0.3;
            var attemptsForHighEnoughProbability =
                (int)
                Math.Round(
                    Math.Max(
                        Math.Log(probablityOfTestFailure, configurationKeyBernoulliTrialSplit),
                        Math.Log(probablityOfTestFailure, 1 - configurationKeyBernoulliTrialSplit)
                    )
                );

            // Act
            var keyRequests = Enumerable.Range(0, attemptsForHighEnoughProbability)
                .Select(async i => await mConfigurationsApi.Get("@tests/multivariantkeys/bernoulli", new Dictionary<string, string> { { "device", Guid.NewGuid().ToString() } }));

            var results = await Task.WhenAll(keyRequests);
            var returnedValues = results.Where(x => x.Type == JTokenType.String).Select(x => x.ToString()).ToList();

            // Assert
            Assert.Contains("true", returnedValues);
            Assert.Contains("false", returnedValues);
            mOutput.WriteLine("Attempts: {0}", attemptsForHighEnoughProbability);
            mOutput.WriteLine("Key Bernulli Thresold: {0}%", Math.Round(configurationKeyBernoulliTrialSplit * 100));
            mOutput.WriteLine("Received \"true\" Rate: {0}%", Math.Round(returnedValues.Count(x => x == "true") * 100d / attemptsForHighEnoughProbability));
            mOutput.WriteLine("Chance for a test fail due to statistics: {0}%", probablityOfTestFailure * 100);
        }

        [Fact]
        public async Task GetSingleKey_WithMultiVariantsValues_ShouldReturnResultToSome()
        {
            // Arrange
            // Using Coupon Collectors Problem to find out when we'll probably get all options
            // Result for success in 99% for 4 equal options of the cases came from here: 
            // http://www.distributome.org/js/calc/CouponCollectorCalculator.html
            const int numberOfAttempts = 30;

            // Act
            var keyRequests = Enumerable.Range(0, numberOfAttempts)
                .Select(async i => await mConfigurationsApi.Get("@tests/multivariantkeys/weighted_normalized", new Dictionary<string, string> { { "device", Guid.NewGuid().ToString() } }));

            var results = await Task.WhenAll(keyRequests);
            var returnedValues = results.Where(x => x.Type == JTokenType.String).Select(x => x.ToString()).ToList();

            // Assert
            mOutput.WriteLine("Attempts: {0}", numberOfAttempts);
            mOutput.WriteLine("Received \"test1\" Rate: {0}%", Math.Round((returnedValues.Count(x => x == "test1") * 100d) / numberOfAttempts));
            mOutput.WriteLine("Received \"test2\" Rate: {0}%", Math.Round((returnedValues.Count(x => x == "test2") * 100d) / numberOfAttempts));
            mOutput.WriteLine("Received \"test3\" Rate: {0}%", Math.Round((returnedValues.Count(x => x == "test3") * 100d) / numberOfAttempts));
            mOutput.WriteLine("Received \"test4\" Rate: {0}%", Math.Round((returnedValues.Count(x => x == "test4") * 100d) / numberOfAttempts));
            Assert.Contains("test1", returnedValues);
            Assert.Contains("test2", returnedValues);
            Assert.Contains("test3", returnedValues);
            Assert.Contains("test4", returnedValues);

        }

        [Theory, MemberData("COMPARISON_OPERATORS_TEST_CONTEXTS", MemberType = typeof(TestContextProvider))]
        public async Task GetSingleKey_ComparisonOperators_ShouldReturnMatchingKeyValue(TestContext testContext)
        {
            await RunContextBasedTest(testContext);
        }

        [Theory, MemberData("IN_OPERATOR_TEST_CONTEXTS", MemberType = typeof(TestContextProvider))]
        public async Task GetSingleKey_InOperator_ShouldReturnMatchingKeyValue(TestContext testContext)
        {
            await RunContextBasedTest(testContext);
        }

        [Theory, MemberData("MULTI_CONDITIONS_TEST_CONTEXTS", MemberType = typeof(TestContextProvider))]
        public async Task GetSingleKey_BasedOnMultiConditionsRules_ShouldReturnMatchingKeyValue(TestContext testContext)
        {
            await RunContextBasedTest(testContext);
        }

        private async Task RunContextBasedTest(TestContext context)
        {
            // Arrange
            mOutput.WriteLine(context.TestName);

            // Act
            var response = await mConfigurationsApi.Get(context.KeyName, context.Context);

            // Assert
            Assert.Equal(JTokenType.String, response.Type);
            Assert.Equal(context.ExpectedValue, response.ToString());
        }
    }
}

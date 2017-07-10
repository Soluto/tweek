using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Xunit;
using Xunit.Abstractions;

namespace Tweek.ApiService.SmokeTests.GetConfigurations
{
    public class ValueDistributionTests
    {
        private readonly ITestOutputHelper mOutput;
        private readonly ITweekApi mTweekApi;

        public ValueDistributionTests(ITestOutputHelper output)
        {
            mOutput = output;
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient(output);
        }

        [Fact(DisplayName = "Get key with value using bernulli open rate", Skip = "Working on this test")]
        public async Task GetKeyWithBernoulliValueDistribution_SeveralRequestsFromDifferentIdentities_ResultsShouldBeDistributed()
        {
            // Arrange
            const double probablityOfTestFailure = 0.001;
            const double configurationKeyBernoulliTrialSplit = 0.3;
            var numberOfAttempts =
                (int)
                Math.Round(
                    Math.Max(
                        Math.Log(probablityOfTestFailure, configurationKeyBernoulliTrialSplit),
                        Math.Log(probablityOfTestFailure, 1 - configurationKeyBernoulliTrialSplit)
                    )
                );

            // Act
            var keyRequests = Enumerable.Range(0, numberOfAttempts)
                .Select(async i => await mTweekApi.GetConfigurations("@smoke_tests/value_distribution/bernoulli", new Dictionary<string, string> { { "device", Guid.NewGuid().ToString() } }));

            var results = await Task.WhenAll(keyRequests);
            var returnedValues = results.Where(x => x.Type == JTokenType.String).Select(x => x.ToString()).ToList();

            // Assert
            Assert.Contains("true", returnedValues);
            Assert.Contains("false", returnedValues);
            mOutput.WriteLine("Attempts: {0}", numberOfAttempts);
            mOutput.WriteLine("Received \"true\" Rate: {0}%", Math.Round(returnedValues.Count(x => x == "true") * 100d / numberOfAttempts));
            mOutput.WriteLine("Chance for a test fail due to statistics: {0}%", probablityOfTestFailure * 100);
        }

        [Fact(DisplayName = "Get key with weighted multi value", Skip = "Working on this test")]
        public async Task GetKeyWithMultiVariantsValues_SeveralRequestsFromDifferentIdentities_ResultsShouldBeDistributed()
        {
            // Arrange
            // Using Coupon Collectors Problem to find out when we'll probably get all options
            // Result for success in 99% for 4 equal options of the cases came from here: 
            // http://www.distributome.org/js/calc/CouponCollectorCalculator.html
            const int numberOfAttempts = 30;

            // Act
            var keyRequests = Enumerable.Range(0, numberOfAttempts)
                .Select(async i => await mTweekApi.GetConfigurations("@smoke_tests/value_distribution/weighted_normalized", new Dictionary<string, string> { { "device", Guid.NewGuid().ToString() } }));

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
    }
}

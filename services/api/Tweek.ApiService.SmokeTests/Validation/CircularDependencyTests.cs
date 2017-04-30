using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Tweek.ApiService.SmokeTests.Validation.Models;
using Xunit;
using Xunit.Abstractions;

namespace Tweek.ApiService.SmokeTests.Validation
{

    public class CircularDependencyTests
    {
        private ITestOutputHelper mOutput;
        private ITweekApi mTweekApi;

        public CircularDependencyTests(ITestOutputHelper output)
        {
            mOutput = output;
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient();
        }

        [Theory(DisplayName = "Validating ruleset which has no circular dependencies should pass")]
        [MemberData("ValidInputs", MemberType = typeof(RulesetsProvider))]
        public async Task Validation_WithoutCircularDependency_Passes(Dictionary<string, RuleDefinition> ruleset)
        {
            // Act
            var result = await mTweekApi.Validate(ruleset);
            // Assert
            Assert.Equal("true", result);
        }

        [Theory(DisplayName = "Validating ruleset which has circular dependencies should fail")]
        [MemberData("CircularDependenciesInputs", MemberType = typeof(RulesetsProvider))]
        public async Task Validation_WithCircularDependency_Fails(Dictionary<string, RuleDefinition> ruleset)
        {
            // Arrange
            // Act
            // Assert
            await Assert.ThrowsAsync<HttpRequestException> (async ()=> await mTweekApi.Validate(ruleset));
        }

    }

}
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Tweek.ApiService.SmokeTests.GetConfigurations.Models;
using Xunit;

namespace Tweek.ApiService.SmokeTests.GetConfigurations
{
    public class IdentityContextTests
    {
        private readonly ITweekApi mTweekApi;

        public IdentityContextTests()
        {
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient();
        }

        [Theory(DisplayName = "Get key by identity")]
        [MemberData("IDENTITY_TEST_CONTEXTS", MemberType = typeof(IdentityBasedTestsContextProvider))]
        public async Task GetKey_WithIdentityInContext_ReturnsValue(TestContext testContext)
        {
            await RunContextBasedTest(testContext);
        }

        private async Task RunContextBasedTest(TestContext context)
        {
            // Act
            var response = await mTweekApi.GetConfigurations(context.KeyName, context.Context);

            // Assert
            Assert.Equal(JTokenType.String, response.Type);
            Assert.Equal(context.ExpectedValue, response.ToString());
        }
    }
}

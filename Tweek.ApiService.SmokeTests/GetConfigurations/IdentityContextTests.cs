using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FSharp.Data;
using RestEase;
using Tweek.ApiService.SmokeTests.GetConfigurations.Models;
using Xunit;
using Xunit.Abstractions;

namespace Tweek.ApiService.SmokeTests.GetConfigurations
{
    public class IdentityContextTests
    {
        private readonly ITestOutputHelper mOutput;
        private readonly ITweekApi mTweekApi;

        public IdentityContextTests(ITestOutputHelper output)
        {
            mOutput = output;
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient();
        }

        [Theory(DisplayName = "Get key by identity")]
        [MemberData("IDENTITY_TEST_CONTEXTS", MemberType = typeof(IdentityBasedTestsContextProvider))]
        public async Task GetKey_WithIdentityInContext_ReturnsValue(TestContext testContext)
        {
            try
            {
                await RunContextBasedTest(testContext);
            }
            catch (ApiException e)
            {
                mOutput.WriteLine(e.ReasonPhrase);
                mOutput.WriteLine(e.Content);
                throw;
            }
            
        }

        private async Task RunContextBasedTest(TestContext context)
        {
            // Act
            var response = await mTweekApi.GetConfigurations(context.KeyName, context.Context.ToDictionary(x=>x.Key, x=>x.Value.AsString()));

            // Assert
            Assert.Equal(JTokenType.String, response.Type);
            Assert.Equal(context.ExpectedValue, response.ToString());
        }
    }
}

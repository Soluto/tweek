using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace Tweek.ApiService.SmokeTests
{
    public class SwaggerTests
    {
        private readonly ITestOutputHelper mOutput;
        private readonly ITweekApi mTweekApi;

        public SwaggerTests(ITestOutputHelper output)
        {
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient(output);
            mOutput = output;
        }

        [Fact(DisplayName = "Verify that Swagger is available on the expected endpoint")]
        public async Task VerifyThatSwaggerIsPresent()
        {
            var result = await mTweekApi.GetSwagger();
            Assert.Equal("2.0", result["swagger"]);
            mOutput.WriteLine(result.ToString());
        }
    }
}


using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace Tweek.ApiService.SmokeTests.Swagger
{
    public class Swagger
    {
        private ITestOutputHelper mOutput;
        private ITweekApi mTweekApi;

        public Swagger(ITweekApi tweekApi, ITestOutputHelper output)
        {
            mTweekApi = tweekApi;
            mOutput = output;
        }

        [Theory(DisplayName = "Verify that Swagger is available on the expected endpoint")]
        public async Task VerifyThatSwaggerIsPresent()
        {
            var result = await mTweekApi.GetSwagger();
            Assert.Equal("2.0", result["swagger"]);
            mOutput.WriteLine(result.ToString());
        }
    }
}


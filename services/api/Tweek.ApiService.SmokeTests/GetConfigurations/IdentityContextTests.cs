using Newtonsoft.Json.Linq;
using System.Linq;
using System.Threading.Tasks;
using FSharpUtils.Newtonsoft;
using RestEase;
using Tweek.ApiService.SmokeTests.GetConfigurations.Models;
using Xunit;
using Xunit.Abstractions;
using System;
using System.Collections.Generic;

namespace Tweek.ApiService.SmokeTests.GetConfigurations
{
    public class IdentityContextTests: IDisposable
    {
        private readonly ITestOutputHelper mOutput;
        private readonly ITweekApi mTweekApi;

        public IdentityContextTests(ITestOutputHelper output)
        {
            mOutput = output;
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient(output);
            Setup();
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

        private void Setup()
        {
            mTweekApi.AppendContext("test", "smokeTest1", new Dictionary<string, JsonValue> {
                        { "FavoriteFruit", JsonValue.NewString("Banana") },
                        { "NickName", JsonValue.NewString("King George") },
                        { "Age", JsonValue.NewNumber(50) },
            }).Wait();
        }

        #region IDisposable Support
        private bool disposedValue = false; // To detect redundant calls

        protected virtual void Dispose(bool disposing)
        {
            if (!disposedValue)
            {
                if (disposing)
                {
                    Task.WaitAll(
                        mTweekApi.RemoveFromContext("test", "smokeTest1", "FavoriteFruit"),
                        mTweekApi.RemoveFromContext("test", "smokeTest1", "NickName"),
                        mTweekApi.RemoveFromContext("test", "smokeTest1", "Age")
                    );
                }

                disposedValue = true;
            }
        }

        // This code added to correctly implement the disposable pattern.
        public void Dispose()
        {
            // Do not change this code. Put cleanup code in Dispose(bool disposing) above.
            Dispose(true);
        }
        #endregion
  }
}

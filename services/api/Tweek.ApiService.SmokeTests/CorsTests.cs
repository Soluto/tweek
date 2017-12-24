using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace Tweek.ApiService.SmokeTests
{
    public class CorsTests
    {
        private readonly ITweekApi mTweekApi;

        public enum CorsHeaders
        {
            Present,
            NotPresent
        }

        public CorsTests(ITestOutputHelper output)
        {
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient(output);
        }

        [Theory(DisplayName = "CORS preflight request returns correct response")]
        [InlineData("http://testorigin", "GET", HttpStatusCode.OK, CorsHeaders.Present)]
        [InlineData("http://testorigin", "SET", HttpStatusCode.NotFound, CorsHeaders.NotPresent)]
        [InlineData("http://testorigin-bad", "GET", HttpStatusCode.OK, CorsHeaders.NotPresent)]
        public async Task WhenCorsPreflightRequestIsSent_ExpectedResponseIsReturned(string origin, string method, HttpStatusCode expectedStatus, CorsHeaders corsHeaders)
        {
            var response = await mTweekApi.GetCorsPreflightResponse(origin, method);
            Assert.Equal(expectedStatus, response.StatusCode);
            if (corsHeaders == CorsHeaders.Present)
            {
                Assert.Contains(origin, response.Headers.GetValues("Access-Control-Allow-Origin"));
                Assert.Contains("Access-Control-Max-Age", response.Headers.Select(pair => pair.Key));
            }
        }
    }
}
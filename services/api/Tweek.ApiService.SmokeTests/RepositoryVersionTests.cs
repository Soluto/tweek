using System.Threading.Tasks;
using Xunit;
using Xunit.Abstractions;

namespace Tweek.ApiService.SmokeTests
{
    public class RepositoryVersionTests
    {
        private readonly ITweekApi mTweekApi;

        public RepositoryVersionTests(ITestOutputHelper output)
        {
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient(output);
        }

        [Fact]
        public async Task GetRepositoryVersion_LatestVersion()
        {
            var latestVersion = await mTweekApi.GetRepositoryVersion();
            Assert.NotNull(latestVersion);
            Assert.NotEmpty(latestVersion);
        }
    }
}

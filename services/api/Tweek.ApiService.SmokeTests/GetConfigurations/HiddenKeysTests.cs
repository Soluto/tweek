using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Xunit;
using Xunit.Abstractions;

namespace Tweek.ApiService.SmokeTests.GetConfigurations
{
    public class HiddenKeysTests
    {
        private readonly ITweekApi mTweekApi;

        public HiddenKeysTests(ITestOutputHelper output)
        {
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient(output);
        }

        [Fact]
        public async Task GetScanFolder_VisibleFolder_ShouldReturnVisibleKeys()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("smoke_tests/not_hidden/_", new Dictionary<string, string>());

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            var expected = JToken.Parse("{\"some_key\":\"some value\"}");
            Assert.Equal(expected, response);
        }

        [Fact]
        public async Task GetScanFolder_HiddenFolder_ShouldReturnVisibleKeys()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("smoke_tests/not_hidden/@hidden/_", new Dictionary<string, string>());

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            var expected = JToken.Parse("{\"visible_key\":\"visible value\"}");
            Assert.Equal(expected, response);
        }

        [Fact]
        public async Task GetScanFolder_IncludeHiddenFolder_ShouldReturnHiddenFolder()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("smoke_tests/not_hidden/_", new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("$include", "_"),
                new KeyValuePair<string, string>("$include", "@hidden/_")
            });

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            var expected = JToken.Parse("{\"@hidden\":{\"visible_key\":\"visible value\"},\"some_key\":\"some value\"}");
            Assert.Equal(expected, response);
        }

        [Fact]
        public async Task GetKey_HiddenKey_ShouldReturnKey()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("smoke_tests/not_hidden/@some_hidden_key", new Dictionary<string, string>());

            // Assert
            Assert.Equal(JTokenType.String, response.Type);
            const string expected = "some hidden value";
            Assert.Equal(expected, response.ToString());
        }
    }
}

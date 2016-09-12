using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Xunit;

namespace Tweek.ApiService.SmokeTests.GetConfigurations
{
    public class KeyPathsTests
    {
        private readonly ITweekApi mTweekApi;

        public KeyPathsTests()
        {
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient();
        }

        [Fact(DisplayName = "Requesting a key should return its value as a string")]
        public async Task GetSingleKey_KeyExists_ShouldReturnKeyValue()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("@tests/nested/key1", new Dictionary<string, string>());

            // Assert
            Assert.Equal(JTokenType.String, response.Type);
            Assert.Equal("test", response.ToString());
        }

        [Fact(DisplayName = "Requesting a non-existant key should return null")]
        public async Task GetSingleKey_KeyDoesntExists_ShouldReturnKeyValue()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("@tests/nested/nonexisting-key", new Dictionary<string, string>());

            // Assert
            Assert.Equal(JTokenType.Null, response.Type);
        }

        [Fact(DisplayName = "Requesting a key tree should return an object with the values for the child keys")]
        public async Task GetKeyTree_KeysExistsInPath_ShouldReturnObjectWithValueForEachKey()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("@tests/nested/_", new Dictionary<string, string>());

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            Assert.Equal("test", response.Value<string>("key1"));
            Assert.Equal("test", response.Value<string>("key2"));
        }

        [Fact(DisplayName = "Requesting a non-existant key tree should return an empty object")]
        public async Task GetKeyTree_PathDoesntExist_ShouldReturnEmptyObject()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("@tests/nested/nonexisting-key-path/_", new Dictionary<string, string>());

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            Assert.Equal("{}", response.ToString());
        }
    }
}

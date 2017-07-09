using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Xunit;
using Xunit.Abstractions;

namespace Tweek.ApiService.SmokeTests.GetConfigurations
{
    public class KeyPathsTests
    {
        private readonly ITweekApi mTweekApi;

        public KeyPathsTests(ITestOutputHelper output)
        {
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient(output);
        }

        [Fact(DisplayName = "Requesting a key should return its value as a string")]
        public async Task GetSingleKey_KeyExists_ShouldReturnKeyValue()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("@tests/keyPath/key1", new Dictionary<string, string>());

            // Assert
            Assert.Equal(JTokenType.String, response.Type);
            Assert.Equal("test", response.ToString());
        }

        [Fact(DisplayName = "Requesting a non-existant key should return null")]
        public async Task GetSingleKey_KeyDoesntExists_ShouldReturnNull()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("@tests/keyPath/nonexisting-key", new Dictionary<string, string>());

            // Assert
            Assert.Equal(JTokenType.Null, response.Type);
        }

        [Fact(DisplayName = "Requesting a key tree should return an object with the values for the child keys")]
        public async Task GetKeyTree_KeysExistsInPath_ShouldReturnObjectWithValueForEachKey()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("@tests/keyPath/_", new Dictionary<string, string>());

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            Assert.Equal(2, response.Count());
            Assert.Equal("test", response.Value<string>("key1"));
            Assert.Equal("test", response.Value<string>("key2"));
        }

        [Fact(DisplayName = "Requesting multiple keys using $include should return an object with the values for all the keys with full path")]
        public async Task GetMultipleKeys_KeysExists_ShouldReturnObjectWithValueForEachKey()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("_", new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("$include", "@tests/keypath/key1"),
                new KeyValuePair<string, string>("$include", "@tests/keypath/key2")
            });

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            Assert.Equal("test", response.Value<JObject>("@tests").Value<JObject>("keypath").Value<string>("key1"));
            Assert.Equal("test", response.Value<JObject>("@tests").Value<JObject>("keypath").Value<string>("key2"));
        }

        [Fact(DisplayName = "Requesting multiple keys using $include should return an object with the values for all the keys with full path")]
        public async Task GetMultipleKeys_WithScan_ShouldReturnObjectWithValueForEachKeyWithoutDuplicates()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("_", new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("$include", "@tests/keypath/key1"),
                new KeyValuePair<string, string>("$include", "@tests/keypath/_")
            });

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            Assert.Equal("test", response.Value<JObject>("@tests").Value<JObject>("keypath").Value<string>("key1"));
            Assert.Equal("test", response.Value<JObject>("@tests").Value<JObject>("keypath").Value<string>("key2"));
        }

        [Fact(DisplayName = "Requesting multiple keys with $include should be relative to the path")]
        public async Task GetMultipleKeys_WithScanRoot_ResultsShouldBeRelativeToThePath()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("@tests/_", new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("$include", "keypath/key1"),
                new KeyValuePair<string, string>("$include", "keypath/_")
            });

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            Assert.Equal("test", response.Value<JObject>("keypath").Value<string>("key1"));
            Assert.Equal("test", response.Value<JObject>("keypath").Value<string>("key2"));
        }

        [Fact(DisplayName = "Requesting a non-existant key tree should return an empty object")]
        public async Task GetKeyTree_PathDoesntExist_ShouldReturnEmptyObject()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("@tests/keyPath/nonexisting-key-path/_", new Dictionary<string, string>());

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            Assert.Equal(0, response.Count());
            Assert.Equal("{}", response.ToString());
        }
    }
}

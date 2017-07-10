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
            var response = await mTweekApi.GetConfigurations("@smoke_tests/key_path/key1", new Dictionary<string, string>());

            // Assert
            Assert.Equal(JTokenType.String, response.Type);
            Assert.Equal("test", response.ToString());
        }

        [Fact(DisplayName = "Requesting a non-existant key should return null")]
        public async Task GetSingleKey_KeyDoesntExists_ShouldReturnNull()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("@smoke_tests/key_path/nonexisting-key", new Dictionary<string, string>());

            // Assert
            Assert.Equal(JTokenType.Null, response.Type);
        }

        [Fact(DisplayName = "Requesting a key tree should return an object with the values for the child keys")]
        public async Task GetKeyTree_KeysExistsInPath_ShouldReturnObjectWithValueForEachKey()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("@smoke_tests/key_path/_", new Dictionary<string, string>());

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
                new KeyValuePair<string, string>("$include", "@smoke_tests/key_path/key1"),
                new KeyValuePair<string, string>("$include", "@smoke_tests/key_path/key2")
            });

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            Assert.Equal("test", response.Value<JObject>("@smoke_tests").Value<JObject>("key_path").Value<string>("key1"));
            Assert.Equal("test", response.Value<JObject>("@smoke_tests").Value<JObject>("key_path").Value<string>("key2"));
        }

        [Fact(DisplayName = "Requesting multiple keys using $include should return an object with the values for all the keys with full path")]
        public async Task GetMultipleKeys_WithScan_ShouldReturnObjectWithValueForEachKeyWithoutDuplicates()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("_", new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("$include", "@smoke_tests/key_path/key1"),
                new KeyValuePair<string, string>("$include", "@smoke_tests/key_path/_")
            });

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            Assert.Equal("test", response.Value<JObject>("@smoke_tests").Value<JObject>("key_path").Value<string>("key1"));
            Assert.Equal("test", response.Value<JObject>("@smoke_tests").Value<JObject>("key_path").Value<string>("key2"));
        }

        [Fact(DisplayName = "Requesting multiple keys with $include should be relative to the path")]
        public async Task GetMultipleKeys_WithScanRoot_ResultsShouldBeRelativeToThePath()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("@smoke_tests/_", new List<KeyValuePair<string, string>>
            {
                new KeyValuePair<string, string>("$include", "key_path/key1"),
                new KeyValuePair<string, string>("$include", "key_path/_")
            });

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            Assert.Equal("test", response.Value<JObject>("key_path").Value<string>("key1"));
            Assert.Equal("test", response.Value<JObject>("key_path").Value<string>("key2"));
        }

        [Fact(DisplayName = "Requesting a non-existant key tree should return an empty object")]
        public async Task GetKeyTree_PathDoesntExist_ShouldReturnEmptyObject()
        {
            // Act
            var response = await mTweekApi.GetConfigurations("@smoke_tests/key_path/nonexisting-key-path/_", new Dictionary<string, string>());

            // Assert
            Assert.Equal(JTokenType.Object, response.Type);
            Assert.Equal(0, response.Count());
            Assert.Equal("{}", response.ToString());
        }
    }
}

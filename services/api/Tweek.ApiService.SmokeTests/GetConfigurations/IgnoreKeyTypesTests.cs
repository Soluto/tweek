using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using Xunit;
using Xunit.Abstractions;

namespace Tweek.ApiService.SmokeTests.GetConfigurations
{
    public class IgnoreKeyTypesTests
    {
        private readonly ITweekApi mTweekApi;

        private const string STRING_KEY = "smoke_tests/ignore_key_types/string_type";
        private const string NUMBER_KEY = "smoke_tests/ignore_key_types/number_type";
        private const string BOOLEAN_KEY = "smoke_tests/ignore_key_types/boolean_type";
        private const string OBJECT_KEY = "smoke_tests/ignore_key_types/object_type";
        private const string ARRAY_KEY = "smoke_tests/ignore_key_types/array_type";

        public IgnoreKeyTypesTests(ITestOutputHelper output)
        {
            mTweekApi = TweekApiServiceFactory.GetTweekApiClient(output);
        }

        [Theory]
        [InlineData(STRING_KEY, "hello")]
        [InlineData(NUMBER_KEY, "15")]
        [InlineData(BOOLEAN_KEY, "true")]
        [InlineData(OBJECT_KEY, "{\"key\":\"value\"}")]
        [InlineData(ARRAY_KEY, "[\"hello\",\"world\"]")]
        public async Task GetStringKey_IgnoreKeyTypesTrue_ReturnsString(string key, string value)
        {
            // Act
            var response = await mTweekApi.GetConfigurations(key, new Dictionary<string, string> {{"$ignoreKeyTypes", "true"}});

            // Assert
            Assert.Equal(JTokenType.String, response.Type);
            Assert.Equal(JToken.FromObject(value), response);
        }

        [Theory]
        [InlineData(STRING_KEY, JTokenType.String, "\"hello\"")]
        [InlineData(NUMBER_KEY, JTokenType.Float, "15")]
        [InlineData(BOOLEAN_KEY, JTokenType.Boolean, "true")]
        [InlineData(OBJECT_KEY, JTokenType.Object, "{\"key\":\"value\"}")]
        [InlineData(ARRAY_KEY, JTokenType.Array, "[\"hello\",\"world\"]")]
        public async Task GetStringKey_IgnoreKeyTypesFalse_ReturnsString(string key, JTokenType type, string value)
        {
            // Act
            var response = await mTweekApi.GetConfigurations(key, new Dictionary<string, string> {{"$ignoreKeyTypes", "false"}});

            // Assert
            Assert.Equal(type, response.Type);
            Assert.Equal(JToken.Parse(value), response);
        }
    }
}
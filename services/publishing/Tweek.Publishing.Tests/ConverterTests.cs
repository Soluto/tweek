using System.Collections.Generic;
using Newtonsoft.Json;
using Tweek.Publishing.Service.Model.Rules;
using Tweek.Publishing.Service.Sync.Converters;
using Xunit;

namespace Tweek.Publishing.Tests
{
    public class PackerTests
    {
        public static IEnumerable<object[]> GetConsts()
        {
            yield return new object[] {"number", 5, "5"};
            yield return new object[] {"boolean", true, "true"};
            yield return new object[] {"string", "value", "\"value\""};
            yield return new object[]
            {
                "object", new Dictionary<string, object>
                {
                    ["test"] = 5,
                },
                "{\"test\":5}",
            };
        }

        [Theory]
        [MemberData(nameof(GetConsts))]
        public void PackConstValue(string type, object value, string expected)
        {
            var converter = new RulesConverter();
            var dictionary = new Dictionary<string, string>
            {
                ["manifests/some/const.json"] = JsonConvert.SerializeObject(new
                {
                    key_path = "some/const",
                    dependencies = new string[] { },
                    valueType = type,
                    meta = new
                    {
                        name = "test",
                    },
                    implementation = new
                    {
                        type = "const",
                        value,
                    },
                }),
            };
            var results = converter.Convert("id", dictionary.Keys, name => dictionary[name]);
            var packedKey = JsonConvert.DeserializeObject<Dictionary<string,KeyDef>>(results.Item2)["some/const"];
            Assert.Equal(expected, packedKey.Payload);
            Assert.Equal("const", packedKey.Format);
            Assert.Empty(packedKey.Dependencies);
        }

        [Fact]
        public void PackJPad()
        {
            var converter = new RulesConverter();
            var jpad = JsonConvert.SerializeObject(new
            {
                partitions = new string[] { },
                rules = new object[] { },
                valueType = "number",
                defaultValue = 5,
            });
            var dictionary = new Dictionary<string, string>
            {
                ["manifests/some/jpad_example.json"] = JsonConvert.SerializeObject(new
                {
                    key_path = "some/jpad_example",
                    dependencies = new string[] { },
                    valueType = "number",
                    meta = new
                    {
                        name = "test",
                    },
                    implementation = new
                    {
                        type = "file",
                        format = "jpad",
                    },
                }),
                ["implementations/jpad/some/jpad_example.jpad"] = jpad,
            };
            var results = converter.Convert("id", dictionary.Keys, name => dictionary[name]);
            var packedKey = JsonConvert.DeserializeObject<Dictionary<string,KeyDef>>(results.Item2)["some/jpad_example"];
            Assert.Equal(jpad, packedKey.Payload);
            Assert.Equal("jpad", packedKey.Format);
            Assert.Empty(packedKey.Dependencies);
        }

        [Fact]
        public void PackAlias()
        {
            var converter = new RulesConverter();
            var dictionary = new Dictionary<string, string>
            {
                ["manifests/some/alias.json"] = JsonConvert.SerializeObject(new
                {
                    key_path = "some/alias",
                    dependencies = new string[] { },
                    implementation = new
                    {
                        type = "alias",
                        key = "some/other_key",
                    },
                }),
            };
            var results = converter.Convert("id", dictionary.Keys, x => dictionary[x]);
            var packedKey = JsonConvert.DeserializeObject<Dictionary<string, KeyDef>>(results.Item2)["some/alias"];
            Assert.Equal("some/other_key", packedKey.Payload);
            Assert.Equal("alias", packedKey.Format);
            Assert.Contains(packedKey.Dependencies, x => x == "some/other_key");
        }
    }
}
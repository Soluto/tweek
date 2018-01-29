using System.Collections.Generic;
using Newtonsoft.Json;
using Tweek.Publishing.Service.Packing;
using Xunit;

namespace Tweek.Publishing.Tests
{
    public class PackerTests
    {
        
        public static IEnumerable<object[]> GetConsts(){
            yield return new object[]{"number", 5, "5"};
            yield return new object[]{"boolean", true, "true"};
            yield return new object[]{"string", "value", "\"value\""};
            yield return new object[]{"object", new Dictionary<string,object>{
                ["test"] = 5
            }, "{\"test\":5}"};
        }

        [Theory]
        [MemberData(nameof(GetConsts))]
        public void PackConstValue(string type, object value, string expected)
        {
            var packer = new Packer();
            var dictionary = new Dictionary<string, string>(){
                ["manifests/some/const.json"] = JsonConvert.SerializeObject(new {
                    key_path= "some/const",
                    dependencies = new string[]{},
                    valueType = type,
                    meta = new {
                        name= "test"
                    },
                    implementation = new {
                        type = "const",
                        value = value
                    }
                })
            };
            var results = packer.Pack(dictionary.Keys, x=>dictionary[x]);
            var packedKey = results["some/const"];
            Assert.Equal(packedKey.payload, expected);
            Assert.Equal(packedKey.format, "const");
            Assert.Empty(packedKey.dependencies);
        }

        [Fact]
        public void PackJPad()
        {
            var packer = new Packer();
            var jpad = JsonConvert.SerializeObject(new {
                    partitions = new string[]{},
                    rules =  new object[]{},
                    valueType = "number",
                    defaultValue = 5
                });
            var dictionary = new Dictionary<string, string>(){
                ["manifests/some/jpad_example.json"] = JsonConvert.SerializeObject(new {
                    key_path= "some/jpad_example",
                    dependencies = new string[]{},
                    valueType = "number",
                    meta = new {
                        name= "test"
                    },
                    implementation = new {
                        type = "file",
                        format = "jpad"
                    }
                }),
                ["implementations/jpad/some/jpad_example.jpad"] = jpad
            };
            var results = packer.Pack(dictionary.Keys, x=>dictionary[x]);
            var packedKey = results["some/jpad_example"];
            Assert.Equal(packedKey.payload, jpad);
            Assert.Equal(packedKey.format, "jpad");
            Assert.Empty(packedKey.dependencies);
        }

        [Fact]
        public void PackAlias()
        {
            var packer = new Packer();
            var jpad = JsonConvert.SerializeObject(new {
                    partitions = new string[]{},
                    rules =  new object[]{},
                    valueType = "number",
                    defaultValue = 5
                });
            var dictionary = new Dictionary<string, string>(){
                ["manifests/some/alias.json"] = JsonConvert.SerializeObject(new {
                    key_path= "some/alias",
                    dependencies = new string[]{},
                    implementation = new {
                        type = "alias",
                        key = "some/other_key"
                    }
                })
            };
            var results = packer.Pack(dictionary.Keys, x=>dictionary[x]);
            var packedKey = results["some/alias"];
            Assert.Equal(packedKey.payload, "some/other_key");
            Assert.Equal(packedKey.format, "alias");
            Assert.Contains(packedKey.dependencies, x=> x == "some/other_key");
        }
    }
}
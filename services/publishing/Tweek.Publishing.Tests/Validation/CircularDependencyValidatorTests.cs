using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Tweek.Publishing.Service.Validation;
using Xunit;

namespace Tweek.Publishing.Tests.Validation
{
    public class CircularDependencyValidatorTests
    {
        [Fact]
        public async Task ValidatePassWhenNoCircularDependencies(){
            var validator = new CircularDependencyValidator();
            var files = new Dictionary<string,string>(){
                ["manifests/a.json"]= JsonConvert.SerializeObject(new {
                    dependencies = new string[]{"b"},
                    key_name = "a",
                    implementation = new {
                        type = "jpad"
                    }
                }),
                ["manifests/b.json"]= JsonConvert.SerializeObject(new {
                    dependencies = new string[]{"c"},
                    key_name = "b",
                    implementation = new {
                        type = "jpad"
                    }
                })
            };

            await validator.Validate("manifests/a.json", async x => files[x]);
        }

        [Fact]
        public async Task ValidateShouldDetectCircularDependencies(){
            var validator = new CircularDependencyValidator();
            var files = new Dictionary<string,string>(){
                ["manifests/a.json"]= JsonConvert.SerializeObject(new {
                    dependencies = new string[]{"b"},
                    key_name = "a",
                    implementation = new {
                        type = "jpad"
                    }
                }),
                ["manifests/b.json"]= JsonConvert.SerializeObject(new {
                    dependencies = new string[]{"c"},
                    key_name = "b",
                    implementation = new {
                        type = "jpad"
                    }
                }),
                ["manifests/c.json"]= JsonConvert.SerializeObject(new {
                    dependencies = new string[]{"a"},
                    key_name = "c",
                    implementation = new {
                        type = "jpad"
                    }
                })
            };

            await Assert.ThrowsAsync<CircularValidationException>(()=> validator.Validate("manifests/a.json", async x => files[x]));
        }

        [Fact]
        public async Task ValidateShouldDetectCircularDependenciesCreatedByAliases(){
            var validator = new CircularDependencyValidator();
            var files = new Dictionary<string,string>(){
                ["manifests/a.json"]= JsonConvert.SerializeObject(new {
                    dependencies = new string[]{"b"},
                    key_name = "a",
                    implementation = new {
                        type = "jpad"
                    }
                }),
                ["manifests/b.json"]= JsonConvert.SerializeObject(new {
                    key_name = "b",
                    implementation = new {
                        type = "alias",
                        key = "a"
                    }
                })
            };

            await Assert.ThrowsAsync<CircularValidationException>(()=> validator.Validate("manifests/a.json", async x => files[x]));
        }
    }
}
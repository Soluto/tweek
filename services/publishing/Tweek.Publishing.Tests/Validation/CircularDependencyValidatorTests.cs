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
            var files = new Dictionary<string,string>
            {
                ["manifests/a.json"]= JsonConvert.SerializeObject(new {
                    dependencies = new[]{"b"},
                    key_name = "a",
                    implementation = new {
                        type = "jpad"
                    }
                }),
                ["manifests/b.json"]= JsonConvert.SerializeObject(new {
                    dependencies = new[]{"c"},
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
            var files = new Dictionary<string,string>
            {
                ["manifests/a.json"]= JsonConvert.SerializeObject(new {
                    dependencies = new[]{"b"},
                    key_name = "a",
                    implementation = new {
                        type = "jpad"
                    }
                }),
                ["manifests/b.json"]= JsonConvert.SerializeObject(new {
                    dependencies = new[]{"c"},
                    key_name = "b",
                    implementation = new {
                        type = "jpad"
                    }
                }),
                ["manifests/c.json"]= JsonConvert.SerializeObject(new {
                    dependencies = new[]{"a"},
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
            var files = new Dictionary<string,string>
            {
                ["manifests/a.json"]= JsonConvert.SerializeObject(new {
                    dependencies = new[]{"b"},
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

        [Fact]
        public async Task ShouldWorkWithMultipleDepTrees(){
            var validator = new CircularDependencyValidator();
            var files = new Dictionary<string,string>
            {
                ["manifests/a.json"]= JsonConvert.SerializeObject(new {
                    dependencies = new[]{"b", "c"},
                    key_name = "a",
                    implementation = new {
                        type = "jpad"
                    }
                }),
                ["manifests/b.json"]= JsonConvert.SerializeObject(new {
                    key_name = "b",
                    dependencies = new[]{"d"},
                    implementation = new {
                        type = "jpad"
                    }
                }),
                ["manifests/c.json"]= JsonConvert.SerializeObject(new {
                    key_name = "c",
                    dependencies = new[]{"d"},
                    implementation = new {
                        type = "jpad"
                    }
                }),
                ["manifests/d.json"]= JsonConvert.SerializeObject(new {
                    key_name = "d",
                    implementation = new {
                        type = "jpad"
                    }
                })
            };

            await validator.Validate("manifests/a.json", async x => files[x]);
        }
    }
}
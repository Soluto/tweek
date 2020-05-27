using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Tweek.Publishing.Service.Validation;
using Xunit;

namespace Tweek.Publishing.Tests.Validation
{
    public class ManifestStructureValidatorTests
    {
        [Fact]
        public async Task ValidateErrorOnEmptyKeyPath()
        {
            var validator = new ManifestStructureValidator();
            var files = new Dictionary<string, string>
            {
                ["manifests/the/path/key.json"] = JsonConvert.SerializeObject(new
                {
                    key_path = "",
                    dependencies = new string[0],
                    implementation = new
                    {
                        type = "file",
                        format = "jpad"
                    },
                }),
            };

            await Assert.ThrowsAsync<ManifestStructureException>(() =>
                validator.Validate("manifests/the/path/key.json", async x => files[x]));
        }
        
        [Fact]
        public async Task ValidateExistingKeyPath()
        {
            var validator = new ManifestStructureValidator();
            var files = new Dictionary<string, string>
            {
                ["manifests/the/path/key.json"] = JsonConvert.SerializeObject(new
                {
                    key_path = "the/path/key",
                    dependencies = new string[0],
                    implementation = new
                    {
                        type = "file",
                        format = "jpad"
                    },
                }),
            };

            await validator.Validate("manifests/the/path/key.json", async x => files[x]);
        }
    }
}
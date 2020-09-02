using System.Collections.Generic;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Tweek.Publishing.Service.Validation;
using Xunit;

namespace Tweek.Publishing.Tests.Validation
{
    public class NestedKeysValidatorTests
    {
        [Fact]
        public async Task PassesWhenNoParentKey()
        {
            var validator = new NestedKeysValidator();
            var files = new Dictionary<string, string>
            {
                {"manifests/some/other/key", ""}
            };

            await validator.Validate("manifests/a/b.json", async x => files[x]);
        }
        
        [Fact]
        public async Task FailsWhenParentKeyExists()
        {
            var validator = new NestedKeysValidator();
            var files = new Dictionary<string, string>
            {
                {"manifests/a.json", ""}
            };

            await Assert.ThrowsAsync<NestedKeysException>(() =>
                validator.Validate("manifests/a/b.json", async x => files[x]));
        }
    }
}
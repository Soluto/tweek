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
        
        [Fact]
        public async Task FailsWhenDeepParentKeyExists()
        {
            var validator = new NestedKeysValidator();
            var files = new Dictionary<string, string>
            {
                {"manifests/a/b.json", ""}
            };

            await Assert.ThrowsAsync<NestedKeysException>(() =>
                validator.Validate("manifests/a/b/c/d/e/f.json", async x => files[x]));
        }
        
        [Fact]
        public async Task DoesntGoIntoAnInfiniteLoopInEdgeCasesOrBadInput()
        {
            var validator = new NestedKeysValidator();
            var files = new Dictionary<string, string>
            {
                {"manifests/a/b.json", ""}
            };

            await validator.Validate("", async x => files[x]);
            await validator.Validate("/something", async x => files[x]);
            await validator.Validate("something", async x => files[x]);
            await validator.Validate("/manifests", async x => files[x]);
            await validator.Validate("/////", async x => files[x]);
        }
    }
}
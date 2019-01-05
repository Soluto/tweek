using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Tweek.Publishing.Service.Validation;
using Xunit;

namespace Tweek.Publishing.Tests.Validation
{
    public class SubjectExtractionValidatorTests
    {
        const string subExtractionRulesFileName = @"subject_extraction_rules.rego";

        [Fact]
        public async Task ValidatePassWhenValidOpaRules()
        {
            var validator = new SubjectExtractionValidator();
            var files = new Dictionary<string, string>
            {
                [subExtractionRulesFileName] = @"
                    package rules

                    default subject = { ""user"": null, ""group"": null }
                    subject = { ""user"": input.sub, ""group"": ""default"" }
                ",
            };
            await validator.Validate(subExtractionRulesFileName, async x => files[x]);
        }

        [Fact]
        public async Task ValidateFailsWhenInvalidOpaRules()
        {
            var validator = new SubjectExtractionValidator();
            var files = new Dictionary<string, string>
            {
                [subExtractionRulesFileName] = @"
                    default subject = { ""user"": null, ""group"": null }
                    subject = { ""user"": input.sub, ""group"": ""default"" }
                ",
            };
            await Assert.ThrowsAsync<SubjectExtractionRulesValidationException>(() => validator.Validate(subExtractionRulesFileName, async x => files[x]));
        }
    }
}
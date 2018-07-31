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
        const string subExtractionRulesFileName = @"rules.rego";

        [Fact]
        public async Task ValidatePassWhenValidOpaRules()
        {
            var sb = new StringBuilder();
            sb.AppendLine("package rules");
            sb.AppendLine();
            sb.AppendLine("default subject = { \"user\": null,\"group\": null }");
            sb.AppendLine("subject = { \"user\": input.sub, \"group\": \"default\" }");

            var validator = new SubjectExtractionValidator();
            var files = new Dictionary<string, string>
            {
                [subExtractionRulesFileName] = sb.ToString()
            };
            await validator.Validate(subExtractionRulesFileName, async x => files[x]);
        }

        [Fact]
        public async Task ValidateFailsWhenInvalidOpaRules()
        {
            var sb = new StringBuilder();            
            sb.AppendLine("default subject = { \"user\": null,\"group\": null }");
            sb.AppendLine("subject = { \"user\": input.sub, \"group\": \"default\" }");

            var validator = new SubjectExtractionValidator();
            var files = new Dictionary<string, string>
            {
                [subExtractionRulesFileName] = sb.ToString()
            };
            await Assert.ThrowsAsync<SubjectExtractionRulesValidationException>(() => validator.Validate(subExtractionRulesFileName, async x => files[x]));
        }
    }
}
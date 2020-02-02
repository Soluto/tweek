using System;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Tweek.Publishing.Service.Model.Rules;

namespace Tweek.Publishing.Service.Validation
{
    public class ManifestStructureValidator : IValidator
    {
        public async Task Validate(string fileName, Func<string, Task<string>> reader)
        {
            string content;
            try
            {
                content = await reader(fileName);
            }
            catch (Exception ex)
            {
                throw new ManifestStructureException(fileName, ex);
            }
            var manifest = JsonConvert.DeserializeObject<Manifest>(content);
            if (string.IsNullOrEmpty(manifest.KeyPath) || !fileName.Contains(manifest.KeyPath)) {
                throw new ManifestStructureException(fileName, "manifest.KeyPath does not match actual file path");
            }
            // todo: additional structural validations
        }
    }
}
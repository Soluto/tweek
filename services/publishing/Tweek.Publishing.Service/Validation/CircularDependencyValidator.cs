using System;
using System.Threading.Tasks;
using LanguageExt;
using Newtonsoft.Json;
using Tweek.Publishing.Service.Packing;

namespace Tweek.Publishing.Service.Validation
{
    public class CircularDependencyValidator : IValidator
    {
        private async Task ValidateRecursive(string fileName, Func<string, Task<string>> reader, Set<string> visited)
        {
            if (visited.Contains(fileName))
            {
                throw new CircularValidationException(fileName);
            }
            string content;
            try
            {
                content = await reader(fileName);
            }
            catch (Exception)
            {
                return;
            }
            var manifest = JsonConvert.DeserializeObject<Manifest>(content);
            var deps = manifest.GetDependencies();
            foreach (var dep in deps)
            {
                var newSet = visited.Add(fileName);
                await ValidateRecursive($"manifests/{dep}.json", reader, newSet);
            }
        }

        public async Task Validate(string fileName, Func<string, Task<string>> reader)
        {
            await ValidateRecursive(fileName, reader, Set<string>.Empty);
        }
    }
}
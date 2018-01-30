using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Tweek.Publishing.Service.Packing;
using LanguageExt;

namespace Tweek.Publishing.Service.Validation
{
  public class CircularDependencyValidator : IValidator
  { 
    private async Task ValidateRecursive(string fileName, Func<string,Task<string>> reader, Set<string> visited){
       if (visited.Contains(fileName)){
         throw new CircularValidationException(fileName);
       }
       string content;
       try
        {
          content = await reader(fileName);
        }
        catch (Exception ex)
        {
          return;
        }
        var manifest = JsonConvert.DeserializeObject<Manifest>(content);
        var deps = manifest.GetDependencies();
        foreach (var dep in deps)
        {
          await ValidateRecursive($"manifests/{dep}.json", reader, visited.Add(fileName));
        }
    }

    public async Task Validate(string fileName, Func<string, Task<string>> reader)
    {
      await ValidateRecursive(fileName, reader, Set<string>.Empty);
    }

  }
}
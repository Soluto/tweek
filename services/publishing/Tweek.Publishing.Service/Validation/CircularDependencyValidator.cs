using System.Threading.Tasks;
using System;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json;
using Tweek.Publishing.Service.Packing;

namespace Tweek.Publishing.Service.Validation
{
  public class CircularDependencyValidator : IValidator
  {
    public async Task Validate(string fileName, Func<string, Task<string>> reader)
    {
      var queue = new Queue<string>();
      queue.Enqueue(fileName);
      var visited = new HashSet<string>();
      while (queue.Count > 0)
      {
        var path = queue.Dequeue();
        if (visited.Contains(path))
        {
          throw new CircularValidationException(path);
        }
        Console.WriteLine($"checking dependencies for {path}");
        visited.Add(path);
        string content = null;
        try
        {
          content = await reader(path);
        }
        catch (Exception ex)
        {
          continue;
        }
        var manifest = JsonConvert.DeserializeObject<Manifest>(content);
        var deps = manifest.GetDependencies();
        
        foreach (var dep in deps)
        {
          queue.Enqueue($"manifests/{dep}.json");
        }
      }

    }

  }
}
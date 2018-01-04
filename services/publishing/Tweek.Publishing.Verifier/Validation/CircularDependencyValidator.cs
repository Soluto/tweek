using System.Threading.Tasks;
using System;
using Tweek.Publishing.Verifier.Validation;
using System.Collections.Generic;
using Newtonsoft.Json.Linq;

namespace Tweek.Publishing.Verifier
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
          throw new Exception("circular deps");
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
        var json = JObject.Parse(content);
        string[] dependencies = json["dependencies"].ToObject<string[]>() ?? Array.Empty<string>();
        foreach (var dep in dependencies)
        {
          queue.Enqueue($"manifests/{dep}.json");
        }
      }

    }

  }
}
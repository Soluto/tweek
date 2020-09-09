using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Tweek.Engine.Drivers.Rules;

namespace Tweek.Drivers.Rules.FileSystem
{
  public class FileSystemRulesDriver : IRulesDriver
  {
    private readonly string directoryPath;

    public FileSystemRulesDriver(string directoryPathInput) => directoryPath = directoryPathInput;

    public async Task<string> GetVersion(CancellationToken cancellationToken = default(CancellationToken))
    {
      var json = await readFile("versions", cancellationToken);
      var versions = JObject.Parse(json);
      return versions["latest"].Value<string>();
    }

    public async Task<Dictionary<string, RuleDefinition>> GetRuleset(string version, CancellationToken cancellationToken = default(CancellationToken))
    {
      var json = await readFile(version, cancellationToken);
      return JsonConvert.DeserializeObject<Dictionary<string, RuleDefinition>>(json);
    }

    private Task<string> readFile(string fileName, CancellationToken cancellationToken)
    {
      var filePath = Path.Combine(directoryPath, fileName);
      return File.ReadAllTextAsync(filePath, cancellationToken);
    }
  }
}

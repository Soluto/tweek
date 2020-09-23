using Newtonsoft.Json;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using Tweek.Engine.Drivers.Rules;

namespace Tweek.Drivers.Rules.FileSystem
{
  public class FileSystemRulesDriver : IRulesDriver
  {
    private readonly string filePath;

    public FileSystemRulesDriver(string filePathInput) => filePath = filePathInput;

    public Task<string> GetVersion(CancellationToken cancellationToken = default(CancellationToken))
    {
      return Task.FromResult(filePath);
    }

    public async Task<Dictionary<string, RuleDefinition>> GetRuleset(string version, CancellationToken cancellationToken = default(CancellationToken))
    {
      var json = await File.ReadAllTextAsync(filePath, cancellationToken);
      return JsonConvert.DeserializeObject<Dictionary<string, RuleDefinition>>(json);
    }
  }
}

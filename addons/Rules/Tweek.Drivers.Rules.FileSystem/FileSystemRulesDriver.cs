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

    public async Task<string> GetVersion(CancellationToken _)
    {
      var json = await readFile("versions");
      var versions = JObject.Parse(json);
      return versions["latest"].Value<string>();
    }

    public async Task<Dictionary<string, RuleDefinition>> GetRuleset(string version, CancellationToken _)
    {
      var json = await readFile(version);
      return JsonConvert.DeserializeObject<Dictionary<string, RuleDefinition>>(json);
    }

    private async Task<string> readFile(string fileName)
    {
      var filePath = Path.Combine(directoryPath, fileName);
      string json = null;

      using (var streamReader = new StreamReader(filePath))
      {
        json = await streamReader.ReadToEndAsync();
      }

      return json;
    }
  }
}

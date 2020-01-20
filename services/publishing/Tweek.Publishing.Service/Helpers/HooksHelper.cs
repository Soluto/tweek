using System.Text.RegularExpressions;
using System;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using App.Metrics;
using App.Metrics.Counter;
using Tweek.Publishing.Service.Model.Hooks;
using Tweek.Publishing.Service.Model.Rules;
using Newtonsoft.Json;

namespace Tweek.Publishing.Helpers {
  using KeyPathsDictionary = Dictionary< ( string type, string url ), HashSet<string> >;

  public class HooksHelper {
    private readonly IMetrics _metrics;
    private readonly ILogger _logger;
    private readonly Func<string, Task<string>> _git;
    private readonly TriggerHooksHelper _triggerHelper;
    private readonly Regex _keysRegex;
    private readonly CounterOptions _hooksMetric = new CounterOptions{Context = "publishing", Name = "hooks"};
    private readonly MetricTags _metricsFailure = new MetricTags("Status", "Failure");
    private readonly string[] NotificationHookTypes = new string[] { "notification_webhook" };

    public HooksHelper(Func<string, Task<string>> gitExecutor, TriggerHooksHelper triggerHelper, IMetrics metrics, ILogger logger = null) {
      this._logger = logger ?? NullLogger.Instance;
      this._git = gitExecutor;
      this._metrics = metrics;
      this._triggerHelper = triggerHelper;
      this._keysRegex = new Regex(@"(?:implementations/jpad/|manifests/)(.*)\..*", RegexOptions.Compiled);
    }

    public async Task TriggerNotificationHooksForCommit(string commitId) {
      try {
        var keyPaths = await GetKeyPathsFromCommit(commitId);
        var author = await GetCommitAuthor(commitId);
        var allHooks = await GetAllHooks(commitId);

        var keyPathsByHookUrlAndType = AggregateKeyPathsByHookUrlAndType(keyPaths, allHooks);
        keyPathsByHookUrlAndType = FilterNonNotificationHooks(keyPathsByHookUrlAndType);
        var usedKeyPaths = GetUsedKeyPaths(keyPathsByHookUrlAndType);
        var keyPathsDiffs = await GetKeyPathsDiffs(usedKeyPaths, commitId);

        var hooksWithData = GetHooksWithData(keyPathsByHookUrlAndType, keyPathsDiffs, author);
        await _triggerHelper.TriggerHooks(hooksWithData, commitId);
      } catch (Exception ex) {
        _logger.LogError(ex, $"Failed triggering notification hooks for commit {commitId}");
        _metrics.Measure.Counter.Increment(_hooksMetric, _metricsFailure);
      }
    }

    private Dictionary<( string type, string url ), string> GetHooksWithData(
      KeyPathsDictionary keyPathsByHookUrlAndType,
      Dictionary<string, KeyPathDiff> keyPathsDiffs,
      Author author
    ) {
      return keyPathsByHookUrlAndType.ToDictionary(
        kvp => kvp.Key,
        kvp => {
          var hookKeyPathDiff = kvp.Value.Select( keyPath => keyPathsDiffs[keyPath] );
          var hookData = new HookData(author, hookKeyPathDiff);
          return JsonConvert.SerializeObject(hookData);
        }
      );
    }

    private async Task< Dictionary<string, KeyPathDiff> > GetKeyPathsDiffs(IEnumerable<string> keyPaths, string commitId) {
      var keyPathsDataDict = new Dictionary<string, KeyPathDiff>(keyPaths.Count());

      foreach (var keyPath in keyPaths) {
        var newValue = await GetKeyPathData(keyPath, commitId);
        var oldValue = await GetOldKeyPathData(keyPath, commitId);
        var keyPathDiff = new KeyPathDiff(oldValue, newValue);

        keyPathsDataDict.Add(keyPath, keyPathDiff);
      }

      return keyPathsDataDict;
    }

    private async Task<KeyPathData?> GetOldKeyPathData(string keyPath, string commitId, int commitOffset = 1) {
      return await GetKeyPathData(keyPath, $"{commitId}~{commitOffset}");
    }

    private async Task<KeyPathData?> GetKeyPathData(string keyPath, string revision) {
      string manifestJson;
      var manifestPath = $"manifests/{keyPath}.json";

      try {
        manifestJson = await _git($"show {revision}:{manifestPath}");
      } catch (Exception ex) {
        var missingFileMessage = $"fatal: Path '{manifestPath}' does not exist in '{revision}'\n";
        if (ex.InnerException?.Message == missingFileMessage) return null;

        throw ex;
      }

      var manifest = JsonConvert.DeserializeObject<Manifest>(manifestJson);
      var implementation = await GetImplementation(manifest, revision);

      return new KeyPathData(keyPath, implementation, manifest);
    }

    private async Task<string> GetImplementation(Manifest manifest, string revision) {
      if (manifest.Implementation.Type != "file") return null;

      var implementationFilePath = ManifestExtensions.GetFileImplementionPath(manifest);
      return await _git($"show {revision}:{implementationFilePath}");
    }

    private IEnumerable<string> GetUsedKeyPaths(KeyPathsDictionary keyPathsByHookUrlAndType) {
      return keyPathsByHookUrlAndType.Values.Aggregate(new HashSet<string>(), ( keyPathsAcc, currentKeyPaths ) => {
        keyPathsAcc.UnionWith(currentKeyPaths);
        return keyPathsAcc;
      });
    }

    private KeyPathsDictionary FilterNonNotificationHooks(KeyPathsDictionary hooksDictionary) {
      return hooksDictionary
        .Where( kvp => NotificationHookTypes.Contains(kvp.Key.type) )
        .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
    }

    private KeyPathsDictionary AggregateKeyPathsByHookUrlAndType(IEnumerable<string> allKeyPaths, Hook[] allHooks) {
      return allHooks
        .Select( hook => ( hook, keyPaths: hook.GetMatchingKeyPaths(allKeyPaths) ) )
        .Where( hookTuple => hookTuple.keyPaths.Count() > 0 )
        .GroupBy(
          hookTuple => ( type: hookTuple.hook.Type, url: hookTuple.hook.Url ),
          hookTuple => hookTuple.keyPaths
        )
        .ToDictionary(
          hookGrouping => hookGrouping.Key,
          hookGrouping => hookGrouping.SelectMany(keyPaths => keyPaths).ToHashSet()
        );
    }

    private async Task<Hook[]> GetAllHooks(string commitId) {
      var hooksFile = await _git($"show {commitId}:hooks.json");

      return JsonConvert.DeserializeObject<Hook[]>(hooksFile);
    }

    private async Task<Author> GetCommitAuthor(string commitId) {
      var authorJson = await _git($@"show {commitId} --no-patch --format=""{{\""name\"":\""%an\"",\""email\"":\""%ae\""}}""");

      return JsonConvert.DeserializeObject<Author>(authorJson);
    }

    private async Task<IEnumerable<string>> GetKeyPathsFromCommit(string commitId) {
      var files = await _git($"diff-tree --no-commit-id --name-only -r {commitId}");

      return files
        .Split('\n', StringSplitOptions.RemoveEmptyEntries)
        .Select( file => _keysRegex.Match(file).Groups.Values.Last().Value )
        .Distinct()
        .Where( keyPath => keyPath != "" );
    }
  }

  public struct KeyPathData {
    public string keyPath;
    public string implementation;
    public Manifest manifest;

    public KeyPathData(string keyPath, string implementation, Manifest manifest) {
      this.keyPath = keyPath;
      this.implementation = implementation;
      this.manifest = manifest;
    }
  }

  public struct Author {
    public string name;
    public string email;

    public Author(string name, string email) {
      this.name = name;
      this.email = email;
    }
  }

  public struct KeyPathDiff {
    public KeyPathData? oldValue;
    public KeyPathData? newValue;

    public KeyPathDiff(KeyPathData? oldValue, KeyPathData? newValue) {
      this.oldValue = oldValue;
      this.newValue = newValue;
    }
  }

  public struct HookData {
    public Author author;
    public IEnumerable<KeyPathDiff> updates;

    public HookData(Author author, IEnumerable<KeyPathDiff> updates) {
      this.author = author;
      this.updates = updates;
    }
  }
}
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
using Newtonsoft.Json;

namespace Tweek.Publishing.Helpers {
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
        var allKeyHooks = await GetAllKeyHooks(commitId);

        var keyPathsByHook = AggregateKeyPathsByHook(keyPaths, allKeyHooks);
        keyPathsByHook = FilterNonNotificationHooks(keyPathsByHook);
        var usedKeyPaths = GetUsedKeyPaths(keyPathsByHook);
        var keyPathsData = await GetKeyPathsData(usedKeyPaths, commitId);

        var hooksWithData = GetHooksWithKeyPathData(keyPathsByHook, keyPathsData);
        await _triggerHelper.TriggerHooks(hooksWithData, commitId);
      } catch (Exception ex) {
        _logger.LogError(ex, $"Failed triggering notification hooks for commit {commitId}");
        _metrics.Measure.Counter.Increment(_hooksMetric, _metricsFailure);
      }
    }

    private Dictionary<Hook, string> GetHooksWithKeyPathData(
      Dictionary< Hook, HashSet<string> > keyPathsByHook,
      Dictionary<string, KeyPathData> keyPathsData
    ) {
      return keyPathsByHook.ToDictionary(
        kvp => kvp.Key,
        kvp => {
          var hookData = kvp.Value.Select( keyPath => keyPathsData[keyPath] );
          return JsonConvert.SerializeObject(hookData);
        }
      );
    }

    private async Task< Dictionary<string, KeyPathData> > GetKeyPathsData(IEnumerable<string> keyPaths, string commitId) {
      var keyPathsDataDict = new Dictionary<string, KeyPathData>(keyPaths.Count());

      var keyDataTasks = keyPaths.Select(keyPath => (
        keyPath: Task.FromResult(keyPath),
        implementation: _git($"show {commitId}:implementations/jpad/{keyPath}.jpad"),
        manifest: _git($"show {commitId}:manifests/{keyPath}.json")
      ));

      foreach (var tasks in keyDataTasks) {
        var keyPathData = new KeyPathData(await tasks.keyPath, await tasks.implementation, await tasks.manifest);
        keyPathsDataDict.Add(keyPathData.keyPath, keyPathData);
      }

      return keyPathsDataDict;
    }

    private IEnumerable<string> GetUsedKeyPaths(Dictionary< Hook, HashSet<string> > keyPathsByHook) {
      return keyPathsByHook.Values.Aggregate(new HashSet<string>(), ( keyPathsAcc, currentKeyPaths ) => {
        keyPathsAcc.UnionWith(currentKeyPaths);
        return keyPathsAcc;
      });
    }

    private Dictionary< Hook, HashSet<string> > FilterNonNotificationHooks(Dictionary< Hook, HashSet<string> > hooksDict) {
      return hooksDict
        .Where( kvp => NotificationHookTypes.Contains(kvp.Key.Type) )
        .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
    }

    private Dictionary< Hook, HashSet<string> > AggregateKeyPathsByHook(IEnumerable<string> allKeyPaths, KeyHooks[] allKeyHooks) {
      return allKeyHooks
        .SelectMany(keyHooks => {
          var keyPaths = keyHooks.GetMatchingKeyPaths(allKeyPaths);
          return keyHooks.GetHooks().Select( hook => ( hook, keyPaths ) );
        })
        .Where( hookTuple => hookTuple.keyPaths.Count() > 0 )
        .GroupBy( hookTuple => hookTuple.hook, hookTuple => hookTuple.keyPaths )
        .ToDictionary(
          hookGrouping => hookGrouping.Key,
          hookGrouping => hookGrouping.SelectMany(keyPaths => keyPaths).ToHashSet()
        );
    }

    private async Task<KeyHooks[]> GetAllKeyHooks(string commitId) {
      var hooksFile = await _git($"show {commitId}:hooks.json");

      return JsonConvert.DeserializeObject<KeyHooks[]>(hooksFile);
    }

    private async Task<IEnumerable<string>> GetKeyPathsFromCommit(string commitId) {
      var files = await _git($"diff-tree --no-commit-id --name-only -r {commitId}");

      return files
        .Split('\n', StringSplitOptions.RemoveEmptyEntries)
        .Select( file => _keysRegex.Match(file).Groups.Last().Value )
        .Distinct()
        .Where( keyPath => keyPath != "" );
    }
  }

  public struct KeyPathData {
    public string keyPath;
    public string implementation;
    public string manifest;

    public KeyPathData(string keyPath, string implementation, string manifest) {
      this.keyPath = keyPath;
      this.implementation = implementation;
      this.manifest = manifest;
    }
  }
}
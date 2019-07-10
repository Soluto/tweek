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
    private static HooksHelper _instance;
    private readonly IMetrics _metrics;
    private readonly ILogger _logger;
    private readonly Func<string, Task<string>> _git;
    private readonly Regex _keysRegex;
    private static readonly CounterOptions _hooksMetric = new CounterOptions{Context = "publishing", Name = "hooks"};
    private static readonly MetricTags _metricsSuccess = new MetricTags("Status", "Success");
    private static readonly MetricTags _metricsFailure = new MetricTags("Status", "Failure");

    private HooksHelper(Func<string, Task<string>> gitExecutor, IMetrics metrics, ILogger logger) {
      this._logger = logger;
      this._git = gitExecutor;
      this._metrics = metrics;
      this._keysRegex = new Regex(@"(?:implementations/jpad/|manifests/)(.*)\..*", RegexOptions.Compiled);
    }

    public static void initialize(Func<string, Task<string>> gitExecutor, IMetrics metrics, ILogger logger = null) {
      _instance = new HooksHelper(gitExecutor, metrics, logger ?? NullLogger.Instance);
    }

    public static HooksHelper getInstance() {
      return _instance;
    }

    public async Task triggerNotificationHooksForCommit(string commitId) {
      try {
        var keyPaths = await _getKeyPathsFromCommit(commitId);
        var allHooks = await _getAllHooks(commitId);

        var keyPathsByHook = _aggregateKeyPathsByHook(keyPaths, allHooks);
        var usedKeyPaths = _getUsedKeyPaths(keyPathsByHook);
        var keyPathsData = await _getKeyPathsData(usedKeyPaths, commitId);

        var hooksWithData = _getHooksWithKeyPathData(keyPathsByHook, keyPathsData);
        await _triggerHooks(hooksWithData, commitId);
      } catch (Exception ex) {
        _logger.LogError(ex, $"Failed triggering notification hooks for commit {commitId}");
        _metrics.Measure.Counter.Increment(_hooksMetric, _metricsFailure);
      }
    }

    private async Task _triggerHooks(Dictionary<Hook, string> hooksWithData, string commitId) {
      var triggerTasks = hooksWithData.Select( kvp => kvp.Key.trigger(kvp.Value) );

      foreach (var triggerTask in triggerTasks) {
        try {
          await triggerTask;

          _metrics.Measure.Counter.Increment(_hooksMetric, _metricsSuccess);
        } catch (Exception ex) {
          _logger.LogError(ex, $"Failed triggering a notification hook for commit {commitId}");
          _metrics.Measure.Counter.Increment(_hooksMetric, _metricsFailure);
        }
      }
    }

    private Dictionary<Hook, string> _getHooksWithKeyPathData(
      Dictionary< Hook, HashSet<string> > keyPathsByHook,
      Dictionary<string, KeyPathData> keyPathsData
    ) {
      return keyPathsByHook.Aggregate(new Dictionary<Hook, string>(), (acc, kvp) => {
        var hookData = kvp.Value.Select( keyPath => keyPathsData[keyPath] );
        var hookDataJson = JsonConvert.SerializeObject(hookData);

        acc.Add(kvp.Key, hookDataJson);
        return acc;
      });
    }

    private async Task< Dictionary<string, KeyPathData> > _getKeyPathsData(IEnumerable<string> keyPaths, string commitId) {
      var keyPathsDataDict = new Dictionary<string, KeyPathData>(keyPaths.Count());

      var keyDataTasks = keyPaths.Select(keyPath => new Task<string>[] {
        Task.FromResult(keyPath),
        _git($"show {commitId}:implementations/jpad/{keyPath}.jpad"),
        _git($"show {commitId}:manifests/{keyPath}.json")
      });

      foreach (var tasks in keyDataTasks) {
        var keyPathData = new KeyPathData(await tasks[0], await tasks[1], await tasks[2]);
        keyPathsDataDict.Add(keyPathData.keyPath, keyPathData);
      }

      return keyPathsDataDict;
    }

    private IEnumerable<string> _getUsedKeyPaths(Dictionary< Hook, HashSet<string> > keyPathsByHook) {
      return keyPathsByHook.Values.Aggregate(new HashSet<string>(), ( keyPathsAcc, currentKeyPaths ) => {
        keyPathsAcc.UnionWith(currentKeyPaths);
        return keyPathsAcc;
      });
    }

    private Dictionary< Hook, HashSet<string> > _aggregateKeyPathsByHook(IEnumerable<string> allKeyPaths, KeyHooks[] allHooks) {
      var hooksDict = new Dictionary< Hook, HashSet<string> >();

      return allHooks.Aggregate(hooksDict, (hooks, keyHooks) => {
        var keyPaths = keyHooks.getMatchingKeyPaths(allKeyPaths);
        if (keyPaths.Count() == 0) return hooks;

        foreach (var hook in keyHooks.getHooks()) {
          if (!hooks.ContainsKey(hook)) hooks.Add(hook, keyPaths.ToHashSet<string>());

          hooks[hook].UnionWith(keyPaths.ToHashSet<string>());
        }

        return hooks;
      });
    }

    private async Task<KeyHooks[]> _getAllHooks(string commitId) {
      var hooksFile = await _git($"show {commitId}:hooks.json");

      return JsonConvert.DeserializeObject<KeyHooks[]>(hooksFile);
    }

    private async Task<IEnumerable<string>> _getKeyPathsFromCommit(string commitId) {
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
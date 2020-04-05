using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using App.Metrics;
using App.Metrics.Counter;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;
using Newtonsoft.Json;
using Tweek.Publishing.Service.Model.Hooks;
using Tweek.Publishing.Service.Model.Rules;

namespace Tweek.Publishing.Helpers
{
    using KeyPathsDictionary = Dictionary<Hook, HashSet<string>>;

    public class HooksHelper
    {
        private readonly IMetrics _metrics;
        private readonly ILogger _logger;
        private readonly Func<string, Task<string>> _git;
        private readonly TriggerHooksHelper _triggerHelper;
        private readonly Regex _keysRegex;
        private readonly CounterOptions _hooksMetric = new CounterOptions {Context = "publishing", Name = "hooks"};
        private readonly MetricTags _metricsFailure = new MetricTags("Status", "Failure");
        private readonly string[] _postCommitHookTypes = {"notification_webhook"};

        public HooksHelper(Func<string, Task<string>> gitExecutor, TriggerHooksHelper triggerHelper, IMetrics metrics,
            ILogger logger = null)
        {
            _logger = logger ?? NullLogger.Instance;
            _git = gitExecutor;
            _metrics = metrics;
            _triggerHelper = triggerHelper;
            _keysRegex = new Regex(@"(?:implementations/jpad/|manifests/)(.*)\..*", RegexOptions.Compiled);
        }

        public async Task TriggerPostCommitHooks(string commitId)
        {
            try
            {
                var keyPaths = await GetKeyPathsFromCommit(commitId);
                var author = await GetCommitAuthor(commitId);
                var allHooks = await GetAllHooks(commitId);

                var keyPathsByHook = LinkKeyPathsByHook(keyPaths, allHooks);
                keyPathsByHook = FilterNonPostCommitHooks(keyPathsByHook);
                var usedKeyPaths = GetUsedKeyPaths(keyPathsByHook);
                var keyPathsDiffs = await GetKeyPathsDiffs(usedKeyPaths, commitId);

                var hooksWithData = GetHooksWithData(keyPathsByHook, keyPathsDiffs, author);
                await _triggerHelper.TriggerHooks(hooksWithData, commitId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed triggering post commit hook for commit {commitId}");
                _metrics.Measure.Counter.Increment(_hooksMetric, _metricsFailure);
            }
        }

        private static Dictionary<Hook, HookData> GetHooksWithData(
            KeyPathsDictionary keyPathsByHook,
            IReadOnlyDictionary<string, KeyPathDiff> keyPathsDiffs,
            Author author
        ) =>
            keyPathsByHook.ToDictionary(
                kvp => kvp.Key,
                kvp =>
                {
                    var hookKeyPathDiff = kvp.Value.Select(keyPath => keyPathsDiffs[keyPath]);
                    return new HookData(author, hookKeyPathDiff);
                }
            );

        private async Task<Dictionary<string, KeyPathDiff>> GetKeyPathsDiffs(IEnumerable<string> keyPaths,
            string commitId)
        {
            var keyPathDiffs = await Task.WhenAll(keyPaths.Map(async keyPath =>
            {
                var newValue = await GetKeyPathData(keyPath, commitId);
                var oldValue = await GetOldKeyPathData(keyPath, commitId);

                return (key: keyPath, value: new KeyPathDiff(oldValue, newValue));
            }));

            return keyPathDiffs.ToDictionary(tuple => tuple.key, tuple => tuple.value);
        }

        private async Task<KeyPathData?> GetOldKeyPathData(string keyPath, string commitId, int commitOffset = 1) =>
            await GetKeyPathData(keyPath, $"{commitId}~{commitOffset}");

        private async Task<KeyPathData?> GetKeyPathData(string keyPath, string revision)
        {
            string manifestJson;
            var manifestPath = $"manifests/{keyPath}.json";

            try
            {
                manifestJson = await _git($"show {revision}:{manifestPath}");
            }
            catch (Exception ex)
            {
                var missingFileMessage = $"fatal: Path '{manifestPath}' does not exist in '{revision}'\n";
                if (ex.InnerException?.Message == missingFileMessage) return null;

                throw ex;
            }

            var manifest = JsonConvert.DeserializeObject<Manifest>(manifestJson);
            var implementation = await GetImplementation(manifest, revision);

            return new KeyPathData(keyPath, implementation, manifest);
        }

        private async Task<string> GetImplementation(Manifest manifest, string revision)
        {
            if (manifest.Implementation.Type != "file") return null;

            var implementationFilePath = manifest.GetFileImplementationPath();
            return await _git($"show {revision}:{implementationFilePath}");
        }

        private static IEnumerable<string> GetUsedKeyPaths(KeyPathsDictionary keyPathsByHook) =>
            keyPathsByHook.Values.Aggregate(new HashSet<string>(), (keyPathsAcc, currentKeyPaths) =>
            {
                keyPathsAcc.UnionWith(currentKeyPaths);
                return keyPathsAcc;
            });

        private KeyPathsDictionary FilterNonPostCommitHooks(KeyPathsDictionary hooksDictionary)
        {
            return hooksDictionary
                .Where(kvp => _postCommitHookTypes.Contains(kvp.Key.Type))
                .ToDictionary(kvp => kvp.Key, kvp => kvp.Value);
        }

        private static KeyPathsDictionary LinkKeyPathsByHook(IEnumerable<string> allKeyPaths,
            IEnumerable<Hook> allHooks) =>
            allHooks
                .Select(hook => (hook, keyPaths: hook.GetMatchingKeyPaths(allKeyPaths)))
                .Where(hookTuple => hookTuple.keyPaths.Any())
                .ToDictionary(
                    hookGrouping => hookGrouping.hook,
                    hookGrouping => hookGrouping.keyPaths.ToHashSet()
                );

        private async Task<Hook[]> GetAllHooks(string commitId)
        {
            var hooksFile = await _git($"show {commitId}:hooks.json");

            return JsonConvert.DeserializeObject<Hook[]>(hooksFile);
        }

        private async Task<Author> GetCommitAuthor(string commitId)
        {
            var authorJson =
                await _git($@"show {commitId} --no-patch --format=""{{\""name\"":\""%an\"",\""email\"":\""%ae\""}}""");

            return JsonConvert.DeserializeObject<Author>(authorJson);
        }

        private async Task<IEnumerable<string>> GetKeyPathsFromCommit(string commitId)
        {
            var files = await _git($"diff-tree --no-commit-id --name-only -r {commitId}");

            return files
                .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                .Select(file => _keysRegex.Match(file).Groups.Values.Last().Value)
                .Distinct()
                .Where(keyPath => keyPath != "");
        }
    }

    public struct KeyPathData
    {
        public string keyPath;
        public string implementation;
        public Manifest manifest;

        public KeyPathData(string keyPath, string implementation, Manifest manifest)
        {
            this.keyPath = keyPath;
            this.implementation = implementation;
            this.manifest = manifest;
        }
    }

    public struct Author
    {
        public string name;
        public string email;

        public Author(string name, string email)
        {
            this.name = name;
            this.email = email;
        }
    }

    public struct KeyPathDiff
    {
        public KeyPathData? oldValue;
        public KeyPathData? newValue;

        public KeyPathDiff(KeyPathData? oldValue, KeyPathData? newValue)
        {
            this.oldValue = oldValue;
            this.newValue = newValue;
        }
    }

    public struct HookData
    {
        public Author author;
        public IEnumerable<KeyPathDiff> updates;

        public HookData(Author author, IEnumerable<KeyPathDiff> updates)
        {
            this.author = author;
            this.updates = updates;
        }
    }
}
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reactive;
using System.Reactive.Concurrency;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Engine.DataTypes;
using Engine.Management.Drivers;
using LibGit2Sharp;


namespace Engine.Drivers.Rules.Git
{
    
    public class GitDriver : IRulesDriver, IDisposable, IRulesAuthroingDriver
    {
        private readonly string _localUri;
        private readonly IConnectableObservable<Repository> _repo;
        //private readonly IConnectableObservable<Dictionary<string, RuleDefinition>> _rulesData;
        private IDisposable Sub = Disposable.Empty;
        private int IsConnected = 1;
        private static SemaphoreSlim _writeLock = new SemaphoreSlim(1);
        
        public GitDriver(string localUri, string repoUrl = null)
        {
            _localUri = localUri;
            _repo = Observable.FromAsync(async () =>
                await Task.Run(() =>
                {
                    if (Directory.Exists(_localUri)) Directory.Delete(_localUri, true);
                    if (repoUrl == null)
                    {
                        Repository.Init(_localUri);
                    }
                    else
                    {
                        Repository.Clone(repoUrl, _localUri);
                    }
                    var repo = new Repository(_localUri);
                    Sub = new CompositeDisposable(Sub, Disposable.Create(()=>repo.Dispose()));
                    return repo;
                })
            ).PublishLast();
        }

        private IObservable<string> ScanFileTree(string root)
        {
            return Observable.Merge(
                Directory.EnumerateDirectories(root).ToObservable().SelectMany(ScanFileTree),
                Directory.EnumerateFiles(root).ToObservable()
                );
        }

        private async Task<string> ReadFile(string path)
        {
            using (var stream = new StreamReader(File.OpenRead(path)))
            {
                return await stream.ReadToEndAsync();
            }
        }

        public string StripExtension(string path)
        {
            return path.Substring(0, path.Length - Path.GetExtension(path).Length);
        }

        private async Task<Dictionary<string,RuleDefinition>> LoadFiles(string localUri)
        {
            var root = Path.Combine(localUri, "rules");
            var dir = Directory.CreateDirectory(root);
            var data = await ScanFileTree(dir.FullName)
                .SelectMany(async x => new {Path = x.Replace(root + @"\", ""), RuleDef= new RuleDefinition() {Format=Path.GetExtension(x), Payload = await ReadFile(x)}})
                .ToDictionary(x => StripExtension(x.Path).Replace("\\", "/"), x => x.RuleDef);

            return new Dictionary<string, RuleDefinition>(data);
        }

        public event Action OnRulesChange;

        private void Connect()
        {
            if (Interlocked.CompareExchange(ref IsConnected, 1, 0) == 1)
            {
                Sub = new CompositeDisposable(Sub,_repo.Connect());
            }
        }

        public async Task<Dictionary<string, RuleDefinition>> GetAllRules()
        {
            Connect();
            await _repo;
            return await LoadFiles(_localUri);
        }

        private async Task CommitRuleset_Internal(ConfigurationPath path, RuleDefinition ruleDefinition, string authorName, string authorEmail, DateTimeOffset creationTime)
        {
            var repo = await _repo;
            Directory.CreateDirectory(Path.Combine(_localUri, "rules"));
            Directory.CreateDirectory(Path.Combine(_localUri, "rules", path.Prefix));
            var file = string.Join(".", Path.Combine(_localUri, "rules", path), ruleDefinition.Format);
            if (File.Exists(file))
            {
                File.Delete(file);
            }
            using (var writer = new StreamWriter(File.OpenWrite(file)))
            {
                await writer.WriteAsync(ruleDefinition.Payload);
            }
            repo.Stage(file);
            var author = new Signature(new LibGit2Sharp.Identity(authorName, authorEmail), creationTime);
            var commiter = new Signature(new LibGit2Sharp.Identity("tweek", "tweek@soluto.com"), creationTime);
            repo.Commit("updated:" + path, author, commiter, new CommitOptions() {});
            if (repo.Network.Remotes.Any(x => x.Name == "origin"))
            {
                repo.Network.Push(repo.Network.Remotes["origin"], @"refs/heads/master", new PushOptions()
                {
                    CredentialsProvider =
                        (url, fromUrl, types) =>
                            new UsernamePasswordCredentials {Username = "tweek", Password = "***REMOVED***"}
                });
            }
            Console.WriteLine("pushed");
        }

        public async Task CommitRuleset(ConfigurationPath path,   RuleDefinition ruleDefinition, string authorName, string authorEmail, DateTimeOffset creationTime)
        {
            await _writeLock.WaitAsync();
            try
            {
                await CommitRuleset_Internal(path, ruleDefinition, authorName, authorEmail, creationTime);
            }
            finally
            {
                _writeLock.Release();
            }
        }
        
        public void Dispose()
        {
            Sub.Dispose();
        }
    }
}

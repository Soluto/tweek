using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reactive;
using System.Reactive.Disposables;
using System.Reactive.Linq;
using System.Reactive.Subjects;
using System.Threading;
using System.Threading.Tasks;
using Engine.DataTypes;
using Engine.Management.Drivers;
using LibGit2Sharp;
using LibGit2Sharp.Handlers;
using Identity = LibGit2Sharp.Identity;

namespace Engine.Drivers.Rules.Git
{
    public class RemoteRepoSettings
    {
        public string UserName;
        public string Email;
        public string Password;
        public string url;

        public CredentialsHandler CredentialsProvider => (url, fromUrl, types) =>
                                            new UsernamePasswordCredentials
                                            {
                                                Username = UserName,
                                                Password = Password
                                            };
    }

    public class GitDriver : IRulesDriver, IDisposable, IRulesAuthroingDriver
    {
        private readonly string _localUri;
        private readonly RemoteRepoSettings _remoteRepoSettings;
        private readonly IConnectableObservable<Repository> _repo;
        private IDisposable Sub = Disposable.Empty;
        private int IsConnected = 1;
        private static SemaphoreSlim _writeLock = new SemaphoreSlim(1);
        private Subject<Unit> _commitSubject =new Subject<Unit>();
        
        public GitDriver(string localUri, RemoteRepoSettings remoteRepoSettings = null)
        {
            _localUri = localUri;
            _remoteRepoSettings = remoteRepoSettings;
            _repo = Observable.FromAsync(async () =>
                await Task.Run(() =>
                {
                    if (Directory.Exists(_localUri)) Directory.Delete(_localUri, true);
                    if (_remoteRepoSettings == null)
                    {
                        Repository.Init(_localUri);
                    }
                    else
                    {
                        Repository.Clone(_remoteRepoSettings.url, _localUri, new CloneOptions()
                        {
                            CredentialsProvider = _remoteRepoSettings.CredentialsProvider
                        });
                    }
                    var repo = new Repository(_localUri);
                    Sub = new CompositeDisposable(Sub, Disposable.Create(()=>repo.Dispose()));
                    return repo;
                })
            ).PublishLast();
            Sub = new CompositeDisposable(Sub, _commitSubject
                .Throttle(TimeSpan.FromMilliseconds(2000))
                .SelectMany(async _ =>
                {
                    
                    var repo = await _repo;
                    try
                    {
                        await _writeLock.WaitAsync();
                        await Task.Run(() =>
                        {
                            if (repo.Network.Remotes.Any(x => x.Name == "origin"))
                            {
                                repo.Network.Push(repo.Network.Remotes["origin"], @"refs/heads/master", new PushOptions()
                                {
                                    CredentialsProvider = _remoteRepoSettings.CredentialsProvider
                                });
                            }
                        });
                    }
                    finally
                    {
                        _writeLock.Release();
                    }
                    
                    
                    return Unit.Default;
                }).Subscribe());
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
            if (ruleDefinition.Payload != "[]")
            {
                using (var writer = new StreamWriter(File.OpenWrite(file)))
                {
                    await writer.WriteAsync(ruleDefinition.Payload);
                }
            }
            repo.Stage(file);
            var author = new Signature(new Identity(authorName, authorEmail), creationTime);
            var commiter = (_remoteRepoSettings == null) ? author : new Signature(new Identity(_remoteRepoSettings.UserName, _remoteRepoSettings.Email), creationTime);
            repo.Commit("updated:" + path, author, commiter, new CommitOptions() {});
            _commitSubject.OnNext(Unit.Default);

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
            _writeLock.Wait();
            Sub.Dispose();
            _writeLock.Release();
        }
    }
}

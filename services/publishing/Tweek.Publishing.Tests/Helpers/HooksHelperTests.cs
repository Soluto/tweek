using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Threading.Tasks;
using App.Metrics;
using FakeItEasy;
using Newtonsoft.Json;
using RichardSzalay.MockHttp;
using Tweek.Publishing.Helpers;
using Tweek.Publishing.Service.Model.Hooks;
using Tweek.Publishing.Service.Model.Rules;
using Xunit;

namespace Tweek.Publishing.Tests {
  using KeyPathsDictionary = Dictionary<Hook, HashSet<string> >;

  public class HooksHelperTests {
    public HooksHelper hooksHelper;
    public Func< string, Task<string> > fakeGit;

    public HooksHelperTests() {
      InitializeHelpers();
    }

    [Theory]
    [InlineData("implementations/jpad/a/vtt/pp.jpad\n", new[] { "a/vtt/pp" })]
    [InlineData("implementations/jpad/a/vtt/pp.jpad\nmanifests/a/vtt/pp.json\n", new[] { "a/vtt/pp" })]
    [InlineData("implementations/jpad/a/vtt/pp.jpad\nmanifests/a/vtt/pq.json\n", new[] { "a/vtt/pp", "a/vtt/pq" })]
    [InlineData("some/git/path.json\nmanifests/a/vtt/pq.json\n", new[] { "a/vtt/pq" })]
    [InlineData("some/git/path.json\n", new string[] {})]
    [InlineData("", new string[] {})]
    public async Task GetKeyPathsFromCommit(string gitOutput, string[] expectedResult) {
      const string commitId = "abcd";
      var gitCommand = $"diff-tree --no-commit-id --name-only -r {commitId}";

      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);

      var result = await CallPrivateMethod<Task<IEnumerable<string>>>(hooksHelper, "GetKeyPathsFromCommit", new object[] { commitId });

      Assert.Equal(expectedResult, result);
    }

    [Fact]
    public void LinkKeyPathsByHook() {
      var allHooks = new[] {
        new Hook("1", "a/b/c", "notification_webhook", "http://some-domain/awesome_hook", new string[] {}, "json"),
        new Hook("2", "a/b/c", "notification_webhook", "http://some-domain/another_awesome_hook", new string[] {}, "json"),
        new Hook("3", "a/b/*", "notification_webhook", "http://another-domain/ok_hook", new string[] {}, "json"),
        new Hook("4", "c/q/r", "notification_webhook", "http://fourth-domain/meh_hook", new string[] {}, "json"),
        new Hook("5", "a/b/d", "notification_webhook", "http://some-domain/awesome_hook", new string[] {}, "json")
      };
      var allKeyPaths = new[] { "a/b/c", "a/b/d", "a/t/f" };

      var expectedResult = new KeyPathsDictionary
      {
        {allHooks[0], new HashSet<string> {"a/b/c"}},
        {allHooks[1], new HashSet<string> {"a/b/c"}},
        {allHooks[2], new HashSet<string> {"a/b/c", "a/b/d"}},
        {allHooks[4], new HashSet<string> {"a/b/d"}}
      };

      var result = CallPrivateStaticMethod<KeyPathsDictionary>(
        hooksHelper, "LinkKeyPathsByHook", new object[] { allKeyPaths, allHooks }
      );

      Assert.Equal(expectedResult, result);
    }

    [Fact]
    public async Task GetKeyPathData_ReturnsExistingFileData() {
      var mImplementation = new Manifest.MImplementation { Type = "const", Value = "const value" };
      var manifest = new Manifest { KeyPath = "a/b/c", Implementation = mImplementation };
      var keyPathData = new KeyPathData("a/b/c", null, manifest);
      
      var commitId = "abcd";
      var keyPath = "a/b/c";

      var gitCommand = $"show {commitId}:manifests/{keyPath}.json";
      var gitOutput = JsonConvert.SerializeObject(manifest);
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);

      var result = await CallPrivateMethod<Task<KeyPathData?>>(hooksHelper, "GetKeyPathData", new object[] { keyPath, commitId });

      AssertObjectEquality(keyPathData, result);
    }

    [Fact]
    public async Task GetKeyPathData_ReturnsNullOnMissingManifestFile() {
      var commitId = "abcd";
      var keyPath = "a/b/c";

      var gitCommand = $"show {commitId}:manifests/{keyPath}.json";
      var gitEx = new Exception($"fatal: Path 'manifests/{keyPath}.json' does not exist in '{commitId}'\n");
      var shellEx = new Exception("proccess failed", gitEx);
      A.CallTo(() => fakeGit(gitCommand)).Throws(shellEx);

      var result = await CallPrivateMethod<Task<KeyPathData?>>(hooksHelper, "GetKeyPathData", new object[] { keyPath, commitId });

      Assert.Null(result);
    }

    [Fact]
    public async Task GetKeyPathData_ThrowsOnOtherGitExceptions() {
      const string commitId = "abcd";
      const string keyPath = "a/b/c";

      var gitCommand = $"show {commitId}:manifests/{keyPath}.json";
      A.CallTo(() => fakeGit(gitCommand)).Throws(new Exception("Some unexpected error"));

      var resultTask = CallPrivateMethod<Task<KeyPathData?>>(hooksHelper, "GetKeyPathData", new object[] { keyPath, commitId });

      await Assert.ThrowsAnyAsync<Exception>(() => resultTask);
    }

    [Fact]
    public async Task TriggerPostCommitHooks() {
      const string commitId = "abcdef";
      var (mockHttp, hookRequests) = TriggerPostCommitHooks_Setup(commitId);

      await hooksHelper.TriggerPostCommitHooks(commitId);

      Assert.Equal(1, mockHttp.GetMatchCount(hookRequests[0]));
      Assert.Equal(1, mockHttp.GetMatchCount(hookRequests[1]));
      Assert.Equal(1, mockHttp.GetMatchCount(hookRequests[2]));
      Assert.Equal(1, mockHttp.GetMatchCount(hookRequests[3]));
      Assert.Equal(0, mockHttp.GetMatchCount(hookRequests[4]));
      Assert.Equal(1, mockHttp.GetMatchCount(hookRequests[5]));
    }

    private (MockHttpMessageHandler, MockedRequest[]) TriggerPostCommitHooks_Setup(string commitId) {
      var author = new Author("author name", "author@email.com");

      var abcMImplementation = new Manifest.MImplementation { Type = "file", Format = "jpad" };
      var abcManifest = new Manifest { KeyPath = "a/b/c", Implementation = abcMImplementation };
      var abcKeyPathData = new KeyPathData("a/b/c", "{ \"implementationFor\": \"a/b/c\" }", abcManifest);
      var abcKeyPathDiff = new KeyPathDiff(null, abcKeyPathData);

      var abdMImplementation = new Manifest.MImplementation { Type = "const", Value = "abd const value" };
      var abdManifest = new Manifest { KeyPath = "a/b/d", Implementation = abdMImplementation };
      var abdKeyPathData = new KeyPathData("a/b/d", null, abdManifest);
      var abdMImplementationOld = new Manifest.MImplementation { Type = "const", Value = "old abd const value" };
      var abdManifestOld = new Manifest { KeyPath = "a/b/d", Implementation = abdMImplementationOld };
      var abdKeyPathDataOld = new KeyPathData("a/b/d", null, abdManifestOld);
      var abdKeyPathDiff = new KeyPathDiff(abdKeyPathDataOld, abdKeyPathData);

      var abcKeyPathArray = new[] { abcKeyPathDiff };
      var abcabdKeyPathArray = new[] { abcKeyPathDiff, abdKeyPathDiff };

      var mockHttp = new MockHttpMessageHandler();
      var hookRequests = new[]
      {
        MockNotificationHookRequest(mockHttp, "http://some-domain/awesome_hook", abcKeyPathArray, author),
        MockNotificationHookRequest(mockHttp, "http://some-domain/awesome_hook", new []{abdKeyPathDiff}, author),
        MockNotificationHookRequest(mockHttp, "http://some-domain/another_awesome_hook", abcKeyPathArray, author),
        MockNotificationHookRequest(mockHttp, "http://another-domain/ok_hook", abcabdKeyPathArray, author),
        MockNotificationHookRequest(mockHttp, "http://fifth-domain/should_not_be_called_hook", abcKeyPathArray, author),
        MockSlackHookRequest(mockHttp, "http://slack/should_be_called")
      };

      var client = mockHttp.ToHttpClient();
      InitializeHelpers(client);

      TriggerPostCommitHooks_SetupGitStubs(commitId, abcManifest, abdManifest, abdManifestOld);

      return (mockHttp, hookRequests);
    }

    private static MockedRequest MockNotificationHookRequest(MockHttpMessageHandler mockHttp, string url, IEnumerable<KeyPathDiff> expectedContent, Author author) {
      var hookData = new HookData(author, expectedContent);

      return mockHttp
        .When(HttpMethod.Post, url)
        .WithHeaders("Content-Type", "application/json; charset=utf-8")
        .WithContent(JsonConvert.SerializeObject(hookData))
        .Respond(HttpStatusCode.NoContent);
    }
    
    
    private static MockedRequest MockSlackHookRequest(MockHttpMessageHandler mockHttp, string url) =>
      mockHttp
        .When(HttpMethod.Post, url)
        .WithHeaders("Content-Type", "application/json; charset=utf-8")
        .WithPartialContent("\"text\":")
        .Respond(HttpStatusCode.NoContent);

    private void TriggerPostCommitHooks_SetupGitStubs(string commitId, Manifest abcManifest, Manifest abdManifest, Manifest abdManifestOld) {
      // GetKeyPathsFromCommit
      var gitCommand = $"diff-tree --no-commit-id --name-only -r {commitId}";
      var gitOutput = "implementations/jpad/a/b/c.jpad\nmanifests/a/b/c.json\nimplementations/jpad/a/b/d.jpad\nimplementations/jpad/a/t/f.jpad\n";
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);

      // GetCommitAuthor
      gitCommand = $@"show {commitId} --no-patch --format=""{{\""name\"":\""%an\"",\""email\"":\""%ae\""}}""";
      gitOutput = "{\"name\":\"author name\",\"email\":\"author@email.com\"}";
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);

      // GetAllKeyHooks
      var allHooks = new[] {
        new Hook("0", "a/b/c", "notification_webhook", "http://some-domain/awesome_hook", new string[] {}, "json"),
        new Hook("1", "a/b/c", "notification_webhook", "http://some-domain/another_awesome_hook", new string[] {}, "json"),
        new Hook("2", "a/b/*", "notification_webhook", "http://another-domain/ok_hook", new string[] {}, "json"),
        new Hook("3", "a/b/d", "notification_webhook", "http://some-domain/awesome_hook", new string[] {}, "json"),
        new Hook("4", "c/q/r", "notification_webhook", "http://fourth-domain/meh_hook", new string[] {}, "json"),
        new Hook("5", "a/b/c", "not_a_post_commit_hook", "http://fifth-domain/should_not_be_called_hook", new string[] {}, "json"),
        new Hook("6", "a/b/c", "notification_webhook", "http://slack/should_be_called", new string[] {}, "slack")

      };
      gitCommand = $"show {commitId}:hooks.json";
      gitOutput = JsonConvert.SerializeObject(allHooks);
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);

      // GetKeyPathData
      gitCommand = $"show {commitId}:manifests/a/b/c.json";
      gitOutput = JsonConvert.SerializeObject(abcManifest);
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);
      gitCommand = $"show {commitId}:implementations/jpad/a/b/c.jpad";
      gitOutput = "{ \"implementationFor\": \"a/b/c\" }";
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);

      gitCommand = $"show {commitId}~1:manifests/a/b/c.json";
      var gitEx = new Exception($"fatal: Path 'manifests/a/b/c.json' does not exist in '{commitId}~1'\n");
      var shellEx = new Exception("proccess failed", gitEx);
      A.CallTo(() => fakeGit(gitCommand)).Throws(shellEx);

      gitCommand = $"show {commitId}:manifests/a/b/d.json";
      gitOutput = JsonConvert.SerializeObject(abdManifest);
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);

      gitCommand = $"show {commitId}~1:manifests/a/b/d.json";
      gitOutput = JsonConvert.SerializeObject(abdManifestOld);
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);
    }

    private static T CallPrivateMethod<T>(object instance, string methodName, object[] methodParams) {
      var type = instance.GetType();

      var methodInfo = type
        .GetMethods(BindingFlags.NonPublic | BindingFlags.Instance)
        .First(method => method.Name == methodName && method.IsPrivate);

      return (T)methodInfo.Invoke(instance, methodParams);
    }

    private static T CallPrivateStaticMethod<T>(object instance, string methodName, object[] methodParams) {
      var type = instance.GetType();

      var methodInfo = type
        .GetMethods(BindingFlags.NonPublic | BindingFlags.Static)
        .First(method => method.Name == methodName && method.IsPrivate);

      return (T)methodInfo.Invoke(instance, methodParams);
    }

    private static void AssertObjectEquality(object obj1, object obj2) {
      Assert.Equal(JsonConvert.SerializeObject(obj1), JsonConvert.SerializeObject(obj2));
    }

    private void InitializeHelpers(HttpClient client = null) {
      var triggerHelper = new TriggerHooksHelper(client ?? A.Fake<HttpClient>(), A.Fake<IMetrics>());
      fakeGit = A.Fake< Func< string, Task<string> > >();
      hooksHelper = new HooksHelper(fakeGit, triggerHelper, A.Fake<IMetrics>());
    }
  }
}
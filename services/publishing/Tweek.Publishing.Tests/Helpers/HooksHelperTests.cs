using System.Net;
using System.Net.Http;
using System.Reflection;
using System;
using System.Threading.Tasks;
using Tweek.Publishing.Helpers;
using System.Collections.Generic;
using FakeItEasy;
using Xunit;
using System.Linq;
using App.Metrics;
using RichardSzalay.MockHttp;
using Tweek.Publishing.Service.Model.Hooks;
using Tweek.Publishing.Service.Utils;
using Newtonsoft.Json;

namespace Tweek.Publishing.Tests {
  public class HooksHelperTests {
    public HooksHelper hooksHelper;
    public Func< string, Task<string> > fakeGit;

    public HooksHelperTests() {
      fakeGit = A.Fake< Func< string, Task<string> > >();
      HooksHelper.initialize(fakeGit, A.Fake<IMetrics>());
      hooksHelper = HooksHelper.getInstance();
    }

    [Theory]
    [InlineData("implementations/jpad/a/vtt/pp.jpad\n", new string[] { "a/vtt/pp" })]
    [InlineData("implementations/jpad/a/vtt/pp.jpad\nmanifests/a/vtt/pp.json\n", new string[] { "a/vtt/pp" })]
    [InlineData("implementations/jpad/a/vtt/pp.jpad\nmanifests/a/vtt/pq.json\n", new string[] { "a/vtt/pp", "a/vtt/pq" })]
    [InlineData("some/git/path.json\nmanifests/a/vtt/pq.json\n", new string[] { "a/vtt/pq" })]
    [InlineData("some/git/path.json\n", new string[] {})]
    [InlineData("", new string[] {})]
    public async Task _getKeyPathsFromCommit(string gitOutput, string[] expectedResult) {
      var commitId = "abcd";
      var gitCommand = $"diff-tree --no-commit-id --name-only -r {commitId}";

      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);

      var result = await _callPrivateMethod<Task<IEnumerable<string>>>(hooksHelper, "_getKeyPathsFromCommit", new object[] { commitId });

      Assert.Equal(expectedResult, result);
    }

    [Fact]
    public void _aggregateKeyPathsByHook() {
      var hook1 = new Hook("notification_webhook", "http://some-domain/awesome_hook");
      var hook2 = new Hook("notification_webhook", "http://some-domain/another_awesome_hook");
      var hook3 = new Hook("notification_webhook", "http://another-domain/ok_hook");
      var hook4 = new Hook("notification_webhook", "http://fourth-domain/meh_hook");
      var allHooks = new KeyHooks[] {
        new KeyHooks("a/b/c", new Hook[] { hook1, hook2 }),
        new KeyHooks("a/b/*", new Hook[] { hook3 }),
        new KeyHooks("a/b/d", new Hook[] { hook1 }),
        new KeyHooks("c/q/r", new Hook[] { hook4 })
      };
      var allKeyPaths = new string[] { "a/b/c", "a/b/d", "a/t/f" };

      Dictionary< Hook, HashSet<string> > expectedResult = new Dictionary< Hook, HashSet<string> >();
      expectedResult.Add(hook1, new HashSet<string> { "a/b/c", "a/b/d" });
      expectedResult.Add(hook2, new HashSet<string> { "a/b/c" });
      expectedResult.Add(hook3, new HashSet<string> { "a/b/c", "a/b/d" });

      var result = _callPrivateMethod<Dictionary< Hook, HashSet<string> >>(hooksHelper, "_aggregateKeyPathsByHook", new object[] { allKeyPaths, allHooks });

      Assert.Equal(expectedResult, result);
    }

    [Fact]
    public async Task triggerNotificationHooksForCommit() {
      var commitId = "abcdef";
      _triggerNotificationHooksForCommit_setupGitStubs(commitId);

      var abcKeyPathData = new KeyPathData("a/b/c", "{ \"implementationFor\": \"a/b/c\" }", "{ \"manifestFor\": \"a/b/c\" }");
      var abdKeyPathData = new KeyPathData("a/b/d", "{ \"implementationFor\": \"a/b/d\" }", "{ \"manifestFor\": \"a/b/d\" }");
      var abcKeyPathArray = new KeyPathData[] { abcKeyPathData };
      var abcabdKeyPathArray = new KeyPathData[] { abcKeyPathData, abdKeyPathData };

      var mockHttp = new MockHttpMessageHandler();
      var hook1Request = _mockHookRequest(mockHttp, "http://some-domain/awesome_hook", abcabdKeyPathArray);
      var hook2Request = _mockHookRequest(mockHttp, "http://some-domain/another_awesome_hook", abcKeyPathArray);
      var hook3Request = _mockHookRequest(mockHttp, "http://another-domain/ok_hook", abcabdKeyPathArray);
      
      var client = mockHttp.ToHttpClient();
      Http.initialize(client);

      await hooksHelper.triggerNotificationHooksForCommit(commitId);

      Assert.Equal(1, mockHttp.GetMatchCount(hook1Request));
      Assert.Equal(1, mockHttp.GetMatchCount(hook2Request));
      Assert.Equal(1, mockHttp.GetMatchCount(hook3Request));
    }

    private MockedRequest _mockHookRequest(MockHttpMessageHandler mockHttp, string url, KeyPathData[] expectedContent) {
      return mockHttp
        .When(HttpMethod.Post, url)
        .WithHeaders("Content-Type", "application/json; charset=utf-8")
        .WithContent(JsonConvert.SerializeObject(expectedContent))
        .Respond(HttpStatusCode.NoContent);
    }

    private void _triggerNotificationHooksForCommit_setupGitStubs(string commitId) {
      // _getKeyPathsFromCommit
      var gitCommand = $"diff-tree --no-commit-id --name-only -r {commitId}";
      var gitOutput = "implementations/jpad/a/b/c.jpad\nmanifests/a/b/c.json\nimplementations/jpad/a/b/d.jpad\nimplementations/jpad/a/t/f.jpad\n";
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);

      // _getAllHooks
      var hook1 = new Hook("notification_webhook", "http://some-domain/awesome_hook");
      var hook2 = new Hook("notification_webhook", "http://some-domain/another_awesome_hook");
      var hook3 = new Hook("notification_webhook", "http://another-domain/ok_hook");
      var hook4 = new Hook("notification_webhook", "http://fourth-domain/meh_hook");
      var allHooks = new KeyHooks[] {
        new KeyHooks("a/b/c", new Hook[] { hook1, hook2 }),
        new KeyHooks("a/b/*", new Hook[] { hook3 }),
        new KeyHooks("a/b/d", new Hook[] { hook1 }),
        new KeyHooks("c/q/r", new Hook[] { hook4 })
      };
      gitCommand = $"show {commitId}:hooks.json";
      gitOutput = JsonConvert.SerializeObject(allHooks);
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);

      // _getKeyPathsData
      gitCommand = $"show {commitId}:implementations/jpad/a/b/c.jpad";
      gitOutput = "{ \"implementationFor\": \"a/b/c\" }";
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);
      gitCommand = $"show {commitId}:manifests/a/b/c.json";
      gitOutput = "{ \"manifestFor\": \"a/b/c\" }";
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);

      gitCommand = $"show {commitId}:implementations/jpad/a/b/d.jpad";
      gitOutput = "{ \"implementationFor\": \"a/b/d\" }";
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);
      gitCommand = $"show {commitId}:manifests/a/b/d.json";
      gitOutput = "{ \"manifestFor\": \"a/b/d\" }";
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);
    }

    private T _callPrivateMethod<T>(Object instance, string methodName, object[] methodParams) {
      Type type = instance.GetType();

      MethodInfo methodInfo = type
        .GetMethods(BindingFlags.NonPublic | BindingFlags.Instance)
        .Where(method => method.Name == methodName && method.IsPrivate)
        .First();

      return (T)methodInfo.Invoke(instance, methodParams);
    }
  }
}
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
using Newtonsoft.Json;

namespace Tweek.Publishing.Tests {
  using KeyPathsDictionary = Dictionary< ( string type, string url ), HashSet<string> >;

  public class HooksHelperTests {
    public HooksHelper hooksHelper;
    public Func< string, Task<string> > fakeGit;

    public HooksHelperTests() {
      InitializeHelpers();
    }

    [Theory]
    [InlineData("implementations/jpad/a/vtt/pp.jpad\n", new string[] { "a/vtt/pp" })]
    [InlineData("implementations/jpad/a/vtt/pp.jpad\nmanifests/a/vtt/pp.json\n", new string[] { "a/vtt/pp" })]
    [InlineData("implementations/jpad/a/vtt/pp.jpad\nmanifests/a/vtt/pq.json\n", new string[] { "a/vtt/pp", "a/vtt/pq" })]
    [InlineData("some/git/path.json\nmanifests/a/vtt/pq.json\n", new string[] { "a/vtt/pq" })]
    [InlineData("some/git/path.json\n", new string[] {})]
    [InlineData("", new string[] {})]
    public async Task GetKeyPathsFromCommit(string gitOutput, string[] expectedResult) {
      var commitId = "abcd";
      var gitCommand = $"diff-tree --no-commit-id --name-only -r {commitId}";

      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);

      var result = await CallPrivateMethod<Task<IEnumerable<string>>>(hooksHelper, "GetKeyPathsFromCommit", new object[] { commitId });

      Assert.Equal(expectedResult, result);
    }

    [Fact]
    public void AggregateKeyPathsByHookUrlAndType() {
      var allHooks = new Hook[] {
        new Hook("1", "a/b/c", "notification_webhook", "http://some-domain/awesome_hook"),
        new Hook("2", "a/b/c", "notification_webhook", "http://some-domain/another_awesome_hook"),
        new Hook("3", "a/b/*", "notification_webhook", "http://another-domain/ok_hook"),
        new Hook("4", "c/q/r", "notification_webhook", "http://fourth-domain/meh_hook"),
        new Hook("5", "a/b/d", "notification_webhook", "http://some-domain/awesome_hook")
      };
      var allKeyPaths = new string[] { "a/b/c", "a/b/d", "a/t/f" };

      var expectedResult = new KeyPathsDictionary();
      expectedResult.Add(
        ( type: "notification_webhook", url: "http://some-domain/awesome_hook" ),
        new HashSet<string> { "a/b/c", "a/b/d" }
      );
      expectedResult.Add(
        ( type: "notification_webhook", url: "http://some-domain/another_awesome_hook" ),
        new HashSet<string> { "a/b/c" }
      );
      expectedResult.Add(
        ( type: "notification_webhook", url: "http://another-domain/ok_hook" ),
        new HashSet<string> { "a/b/c", "a/b/d" }
      );

      var result = CallPrivateMethod<KeyPathsDictionary>(
        hooksHelper, "AggregateKeyPathsByHookUrlAndType", new object[] { allKeyPaths, allHooks }
      );

      Assert.Equal(expectedResult, result);
    }

    [Fact]
    public async Task TriggerNotificationHooksForCommit() {
      var abcKeyPathData = new KeyPathData("a/b/c", "{ \"implementationFor\": \"a/b/c\" }", "{ \"manifestFor\": \"a/b/c\" }");
      var abdKeyPathData = new KeyPathData("a/b/d", "{ \"implementationFor\": \"a/b/d\" }", "{ \"manifestFor\": \"a/b/d\" }");
      var abcKeyPathArray = new KeyPathData[] { abcKeyPathData };
      var abcabdKeyPathArray = new KeyPathData[] { abcKeyPathData, abdKeyPathData };

      var mockHttp = new MockHttpMessageHandler();
      var hook1Request = MockHookRequest(mockHttp, "http://some-domain/awesome_hook", abcabdKeyPathArray);
      var hook2Request = MockHookRequest(mockHttp, "http://some-domain/another_awesome_hook", abcKeyPathArray);
      var hook3Request = MockHookRequest(mockHttp, "http://another-domain/ok_hook", abcabdKeyPathArray);
      var hook5Request = MockHookRequest(mockHttp, "http://fifth-domain/should_not_be_called_hook", abcKeyPathArray);
      
      var client = mockHttp.ToHttpClient();
      InitializeHelpers(client);

      var commitId = "abcdef";
      TriggerNotificationHooksForCommit_SetupGitStubs(commitId);

      await hooksHelper.TriggerNotificationHooksForCommit(commitId);

      Assert.Equal(1, mockHttp.GetMatchCount(hook1Request));
      Assert.Equal(1, mockHttp.GetMatchCount(hook2Request));
      Assert.Equal(1, mockHttp.GetMatchCount(hook3Request));
      Assert.Equal(0, mockHttp.GetMatchCount(hook5Request));
    }

    private MockedRequest MockHookRequest(MockHttpMessageHandler mockHttp, string url, KeyPathData[] expectedContent) {
      return mockHttp
        .When(HttpMethod.Post, url)
        .WithHeaders("Content-Type", "application/json; charset=utf-8")
        .WithContent(JsonConvert.SerializeObject(expectedContent))
        .Respond(HttpStatusCode.NoContent);
    }

    private void TriggerNotificationHooksForCommit_SetupGitStubs(string commitId) {
      // GetKeyPathsFromCommit
      var gitCommand = $"diff-tree --no-commit-id --name-only -r {commitId}";
      var gitOutput = "implementations/jpad/a/b/c.jpad\nmanifests/a/b/c.json\nimplementations/jpad/a/b/d.jpad\nimplementations/jpad/a/t/f.jpad\n";
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);

      // GetAllKeyHooks
      var allHooks = new Hook[] {
        new Hook("1", "a/b/c", "notification_webhook", "http://some-domain/awesome_hook"),
        new Hook("2", "a/b/c", "notification_webhook", "http://some-domain/another_awesome_hook"),
        new Hook("3", "a/b/*", "notification_webhook", "http://another-domain/ok_hook"),
        new Hook("4", "c/q/r", "notification_webhook", "http://fourth-domain/meh_hook"),
        new Hook("5", "a/b/d", "notification_webhook", "http://some-domain/awesome_hook"),
        new Hook("6", "a/b/c", "not_a_notification_hook", "http://fifth-domain/should_not_be_called_hook")
      };
      gitCommand = $"show {commitId}:hooks.json";
      gitOutput = JsonConvert.SerializeObject(allHooks);
      A.CallTo(() => fakeGit(gitCommand)).Returns(gitOutput);

      // GetKeyPathsData
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

    private T CallPrivateMethod<T>(Object instance, string methodName, object[] methodParams) {
      Type type = instance.GetType();

      MethodInfo methodInfo = type
        .GetMethods(BindingFlags.NonPublic | BindingFlags.Instance)
        .Where(method => method.Name == methodName && method.IsPrivate)
        .First();

      return (T)methodInfo.Invoke(instance, methodParams);
    }

    private void InitializeHelpers(HttpClient client = null) {
      var triggerHelper = new TriggerHooksHelper(client ?? A.Fake<HttpClient>(), A.Fake<IMetrics>());
      fakeGit = A.Fake< Func< string, Task<string> > >();
      hooksHelper = new HooksHelper(fakeGit, triggerHelper, A.Fake<IMetrics>());
    }
  }
}
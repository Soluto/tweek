using Tweek.Publishing.Service.Model.Hooks;
using Xunit;

namespace Tweek.Publishing.Tests {
  public class HookTests {
    public string id = "some_id";
    public string type = "a_type";
    public string url = "a_url";

    [Theory]
    [InlineData("a/b/*", "a/b/c")]
    [InlineData("a/b/*", "a/b/c/e")]
    [InlineData("a/b*", "a/b")]
    [InlineData("*/a/b*", "t/a/b/y")]
    [InlineData("*/a/*", "t/a/p/y")]
    [InlineData("*/e", "t/a/p/y/e")]
    public void MatchesKeyPath_Matching(string hookKeyPath, string keyPath) {
      var hook = new Hook(id, hookKeyPath, type, url, new string[]{},"json");

      Assert.True(hook.MatchesKeyPath(keyPath));
    }

    [Theory]
    [InlineData("a/b/*", "a/b")]
    [InlineData("a/b/*", "a/c/b")]
    [InlineData("*a/b/*", "a/c/b/e")]
    [InlineData("*/e", "t/a/p/y/e/g")]
    public void MatchesKeyPath_NotMatching(string hookKeyPath, string keyPath) {
      var hook = new Hook(id, hookKeyPath, type, url, new string[]{},"json");

      Assert.False(hook.MatchesKeyPath(keyPath));
    }
  }
}
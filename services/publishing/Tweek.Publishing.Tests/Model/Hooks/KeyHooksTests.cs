using Tweek.Publishing.Service.Model.Hooks;
using Xunit;

namespace Tweek.Publishing.Tests {
  public class KeyHooksTests {
    [Theory]
    [InlineData("a/b/*", "a/b/c")]
    [InlineData("a/b/*", "a/b/c/e")]
    [InlineData("a/b*", "a/b")]
    [InlineData("*/a/b*", "t/a/b/y")]
    [InlineData("*/a/*", "t/a/p/y")]
    [InlineData("*/e", "t/a/p/y/e")]
    public void MatchesKeyPath_Matching(string keyHooksPath, string keyPath) {
      var keyHooks = new KeyHooks(keyHooksPath, null);

      Assert.True(keyHooks.MatchesKeyPath(keyPath));
    }

    [Theory]
    [InlineData("a/b/*", "a/b")]
    [InlineData("a/b/*", "a/c/b")]
    [InlineData("*a/b/*", "a/c/b/e")]
    [InlineData("*/e", "t/a/p/y/e/g")]
    public void MatchesKeyPath_NotMatching(string keyHooksPath, string keyPath) {
      var keyHooks = new KeyHooks(keyHooksPath, null);

      Assert.False(keyHooks.MatchesKeyPath(keyPath));
    }
  }
}
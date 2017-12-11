using LanguageExt;
using Tweek.Engine.Core.Context;
using Xunit;

namespace Tweek.Engine.Tests.Core
{
    public class KeyAliasParserTests
    {
        [Fact]
        public void ParseLink_GetLinkValue()
        {
            // Arrange
            const string ORIGINAL_KEY = "some_key";
            var parser = Engine.Core.Rules.Utils.KeyAliasParser;

            string requestedContext = null;
            var getContextValue = new GetContextValue(key =>
            {
                requestedContext = key;
                return Prelude.None;
            });

            // Act
            var result = parser.Parse(ORIGINAL_KEY).GetValue(getContextValue);
            
            // Assert
            Assert.Equal(result, Prelude.None);
            Assert.Equal(requestedContext, $"keys.{ORIGINAL_KEY}");
        }
    }
}
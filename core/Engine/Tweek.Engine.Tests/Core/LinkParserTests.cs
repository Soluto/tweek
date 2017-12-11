using LanguageExt;
using Tweek.Engine.Core.Context;
using Xunit;

namespace Tweek.Engine.Tests.Core
{
    public class LinkParserTests
    {
        [Fact]
        public void ParseLink_GetLinkValue()
        {
            // Arrange
            const string LINKED_KEY = "some_key";
            var parser = Engine.Core.Rules.Utils.LinkedKeyParser;

            string requestedContext = null;
            var getContextValue = new GetContextValue(key =>
            {
                requestedContext = key;
                return Prelude.None;
            });

            // Act
            var result = parser.Parse(LINKED_KEY).GetValue(getContextValue);
            
            // Assert
            Assert.Equal(result, Prelude.None);
            Assert.Equal(requestedContext, $"keys.{LINKED_KEY}");
        }
    }
}
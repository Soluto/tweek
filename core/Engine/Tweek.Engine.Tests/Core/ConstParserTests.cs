using FSharpUtils.Newtonsoft;
using LanguageExt;
using System;
using Tweek.Engine.Core.Rules;
using Xunit;

namespace Engine.Tests.Core
{
    public class ConstParserTests
    {
        [Fact]
        public void ParseJsonReturnTheSameValue()
        {
            var parser = Utils.ConstValueParser;
            Assert.Equal(parser.Parse(@"""test""").GetValue(x=>Prelude.None).Map(x=>x.Value), Prelude.Some(JsonValue.NewString("test")));
            Assert.Equal(parser.Parse(@"5").GetValue(x=>Prelude.None).Map(x=>x.Value), Prelude.Some(JsonValue.NewNumber(5)));
            Assert.Equal(parser.Parse(@"true").GetValue(x=>Prelude.None).Map(x=>x.Value), Prelude.Some(JsonValue.NewBoolean(true)));
        }

        [Fact]
        public void ParseInvalidJSONFails()
        {
           var parser = Utils.ConstValueParser;
           Assert.ThrowsAny<Exception>(()=>parser.Parse(@"test"));
        }
        
    }
}

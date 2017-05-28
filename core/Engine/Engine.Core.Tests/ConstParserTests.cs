using System;
using System.Collections.Generic;
using System.Linq;
using Engine.Core.Context;
using Engine.DataTypes;
using FSharpUtils.Newtonsoft;
using LanguageExt;
using Xunit;
using static Engine.Core.Rules.Utils;
using static LanguageExt.Prelude;
using static FSharpUtils.Newtonsoft.JsonValue;

namespace Engine.Core.Tests
{
    public class ConstParserTests
    {
        [Fact]
        public void ParseJsonReturnTheSameValue()
        {
            var parser = ConstValueParser;
            Assert.Equal(parser.Parse(@"""test""").GetValue(x=>None).Map(x=>x.Value), Some(NewString("test")));
            Assert.Equal(parser.Parse(@"5").GetValue(x=>None).Map(x=>x.Value), Some(NewNumber(5)));
            Assert.Equal(parser.Parse(@"true").GetValue(x=>None).Map(x=>x.Value), Some(NewBoolean(true)));
        }

        [Fact]
        public void ParseInvalidJSONFails()
        {
           var parser = ConstValueParser;
           Assert.ThrowsAny<Exception>(()=>parser.Parse(@"test"));
        }
        
    }
}

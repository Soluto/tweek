using System;
using FSharp.Data;
using Newtonsoft.Json;
using Xunit;

namespace JsonValueConverter.Tests
{
    public class UnitTest1
    {
        [Fact]
        public void TestMethod1()
        {
           var number = JsonConvert.DeserializeObject<JsonValue>("5", new JsonValueConverter());
           Assert.True(true);
        }
    }
}

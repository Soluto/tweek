using System;
using System.Threading;
using FSharp.Data;
using Newtonsoft.Json;
using Xunit;

namespace JsonValueConverter.Tests
{
    class Test
    {
        public JsonValue numberValue;
        public JsonValue stringValue;
        public JsonValue nullValue;
        public JsonValue arrayOfObjectsValue;
    }

    public class JsonValueConverterTests
    {
        [Fact]
        public void CheckJsonConversation()
        {
            var testSubject = new Test()
            {
                numberValue = JsonValue.NewNumber(5),
                stringValue = JsonValue.NewString("abc"),
                nullValue = JsonValue.Null,
                arrayOfObjectsValue = JsonValue.NewArray(
                    new[] {
                    JsonValue.NewNumber(10),
                    JsonValue.NewRecord(new [] {Tuple.Create("propA", JsonValue.NewNumber(5)), Tuple.Create("propB", JsonValue.NewNumber(10))}),
                    JsonValue.Null,
                    JsonValue.NewArray(new [] {JsonValue.NewNumber(10)})
                    }                    
               )
            };
            var converter = new JsonValueConverter();
            var target = JsonConvert.DeserializeObject<Test>(JsonConvert.SerializeObject(testSubject, converter), converter);

            Assert.Equal(testSubject.numberValue, target.numberValue);
            Assert.Equal(testSubject.stringValue, target.stringValue);
            Assert.Equal(testSubject.nullValue, target.nullValue);
            Assert.Equal(testSubject.arrayOfObjectsValue, target.arrayOfObjectsValue);
            
        }
       
    }
}

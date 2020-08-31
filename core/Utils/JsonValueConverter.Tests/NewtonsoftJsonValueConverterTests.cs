using System;
using System.Threading;
using FSharpUtils.Newtonsoft;
using Newtonsoft.Json;
using Xunit;
using Tweek.Utils;

namespace Tweek.Utils.Tests
{
    public class NewtonsoftJsonValueConverterTests
    {
        class Test
        {
            public JsonValue numberValue;
            public JsonValue stringValue;
            public JsonValue nullValue;
            public JsonValue arrayOfObjectsValue;
            public JsonValue dateLikeString;
        }
        
        [Fact]
        public void CheckJsonConversation()
        {
            var testSubject = new Test()
            {
                numberValue = JsonValue.NewNumber(5),
                stringValue = JsonValue.NewString("abc"),
                nullValue = JsonValue.Null,
                dateLikeString = JsonValue.NewString(DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")),
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
            Assert.Equal(testSubject.dateLikeString, target.dateLikeString);

        }
       
    }
}

using System;
using System.Text.Json;
using FSharpUtils.Newtonsoft;
using Xunit;

namespace Tweek.Utils.Tests
{
    public class NativeJsonValueConverterTests
    {
        class Test
        {
            public JsonValue numberValue { get; set; }
            public JsonValue stringValue { get; set; }
            public JsonValue nullValue { get; set; }
            public JsonValue arrayOfObjectsValue { get; set; }
            public JsonValue dateLikeString { get; set; }
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
                    JsonValue.NewArray(new [] {JsonValue.NewNumber(10)})
                    }                    
               )
            };
            var options = new JsonSerializerOptions {Converters = {new NativeJsonValueConverter()}};
            var target = JsonSerializer.Deserialize<Test>(JsonSerializer.Serialize(testSubject, options), options);

            Assert.Equal(testSubject.numberValue, target.numberValue);
            Assert.Equal(testSubject.stringValue, target.stringValue);
            Assert.Null(target.nullValue);
            Assert.Equal(testSubject.arrayOfObjectsValue, target.arrayOfObjectsValue);
            Assert.Equal(testSubject.dateLikeString, target.dateLikeString);

        }
       
    }
}

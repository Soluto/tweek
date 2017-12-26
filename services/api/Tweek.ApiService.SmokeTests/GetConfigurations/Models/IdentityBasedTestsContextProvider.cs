using System.Collections.Generic;
using FSharpUtils.Newtonsoft;
using static FSharpUtils.Newtonsoft.JsonValue;

namespace Tweek.ApiService.SmokeTests.GetConfigurations.Models
{
    public class IdentityBasedTestsContextProvider
    {
        public static IEnumerable<object[]> IDENTITY_TEST_CONTEXTS()
        {
            yield return new object[]{
                new TestContext
                {
                    TestName = "Get key based on identity, should reutrn matching value",
                    KeyName = "smoke_tests/identity_context/color",
                    ExpectedValue = "yellow",
                    Context = new Dictionary<string, JsonValue>
                    {
                        ["test"] = NewString("smokeTest1") 
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = "Get key based on identity with field override, should return matching value",
                    KeyName = "smoke_tests/identity_context/color",
                    ExpectedValue = "green",
                    Context = new Dictionary<string, JsonValue>
                    {
                        ["test"] = NewString("smokeTest1"),
                        ["test.FavoriteFruit"] = NewString("apple")
                    }
                }};

            yield return new object[]{
                new TestContext
                {
                    TestName = "Get key based on unknown identity, should return default value",
                    KeyName = "smoke_tests/identity_context/color",
                    ExpectedValue = "unknown",
                    Context = new Dictionary<string, JsonValue>
                    {
                        ["test"] = NewString("someUnknownIdentity") 
                    }
                }};
        }
    }
}

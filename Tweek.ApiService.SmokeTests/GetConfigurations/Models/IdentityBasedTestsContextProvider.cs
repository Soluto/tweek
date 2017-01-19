using System.Collections.Generic;
using FSharp.Data;
using static FSharp.Data.JsonValue;

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
                    KeyName = "@tests/identityContext/key1",
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
                    KeyName = "@tests/identityContext/key1",
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
                    KeyName = "@tests/identityContext/key1",
                    ExpectedValue = "unknown",
                    Context = new Dictionary<string, JsonValue>
                    {
                        ["test"] = NewString("someUnknownIdentity") 
                    }
                }};
        }
    }
}

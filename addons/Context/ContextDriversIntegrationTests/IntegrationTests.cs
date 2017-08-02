using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.DataTypes;
using Xunit;
using FSharpUtils.Newtonsoft;
using Newtonsoft.Json.Linq;

namespace ContextDriversIntegrationTests
{
    public class IntegrationTests
    {
        private static readonly Identity TestIdentity = new Identity("@test_identity", "test_id");
        private static readonly Dictionary<string, JsonValue> TestContext = new Dictionary<string, JsonValue>
        {
            {"Fruit", JsonValue.NewString("apple")},
            {"Color", JsonValue.NewString("red")},
            {"Taste", JsonValue.NewString("sour")},
            {"Weight", JsonValue.NewFloat(3.141)},
        };

        private const string PROPERTY_TO_REMOVE = "Weight";

        private static readonly Dictionary<string, JsonValue> TestContextAfterRemoval = TestContext
            .Where(pair => pair.Key != PROPERTY_TO_REMOVE)
            .ToDictionary(pair => pair.Key, pair => pair.Value);

        [Theory(DisplayName = "Test Context Operations")]
        [ClassData(typeof(TestContexts))]
        public async Task Test1(ITestableContextDriver driver)
        {
            await driver.ClearAllData();
            await driver.AppendContext(TestIdentity, TestContext);
            Assert.Equal(TestContext, await driver.GetContext(TestIdentity));
            await driver.RemoveFromContext(TestIdentity, PROPERTY_TO_REMOVE);
            Assert.Equal(TestContextAfterRemoval, await driver.GetContext(TestIdentity));
        }
    }
}

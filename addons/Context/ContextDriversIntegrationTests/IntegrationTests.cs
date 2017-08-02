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
        private static readonly Dictionary<string, JsonValue> AnotherTestContext = new Dictionary<string, JsonValue>
        {
            {"Fruit", JsonValue.NewString("apple")},
            {"Color", JsonValue.NewString("yellow")},
            {"Price", JsonValue.NewFloat(2.7)},
        };

        private const string PROPERTY_TO_REMOVE = "Weight";

        private static readonly Dictionary<string, JsonValue> TestContextAfterRemoval = TestContext
            .Where(pair => pair.Key != PROPERTY_TO_REMOVE)
            .ToDictionary(pair => pair.Key, pair => pair.Value);

        private static readonly Dictionary<string, JsonValue> TestContextMergedWithAnotherTestContext = TestContext
            .ToDictionary(pair => pair.Key, pair => pair.Value)
            .Where(pair => !AnotherTestContext.ContainsKey(pair.Key))
            .Concat(AnotherTestContext)
            .ToDictionary(pair => pair.Key, pair => pair.Value);

        [Theory(DisplayName = "ContextAppended_PropertyDeleted_ResultsInCorrectContext")]
        [ClassData(typeof(TestContexts))]
        public async Task ContextAppended_PropertyDeleted_ResultsInCorrectContext(ITestableContextDriver driver)
        {
            await driver.ClearAllData();
            await driver.AppendContext(TestIdentity, TestContext);
            Assert.Equal(TestContext, await driver.GetContext(TestIdentity));
            await driver.RemoveFromContext(TestIdentity, PROPERTY_TO_REMOVE);
            Assert.Equal(TestContextAfterRemoval, await driver.GetContext(TestIdentity));
        }

        [Theory(DisplayName = "ContextAppended_ThenAnotherAppended_ResultIsMerged")]
        [ClassData(typeof(TestContexts))]
        public async Task ContextAppended_ThenAnotherAppended_ResultIsMerged(ITestableContextDriver driver)
        {
            await driver.ClearAllData();
            await driver.AppendContext(TestIdentity, TestContext);
            await driver.AppendContext(TestIdentity, AnotherTestContext);
            Assert.Equal(TestContextMergedWithAnotherTestContext, await driver.GetContext(TestIdentity));
        }

        [Theory(DisplayName = "ContextAppended_ThenSameContextAppended_ResultIsIdempotent")]
        [ClassData(typeof(TestContexts))]
        public async Task ContextAppended_ThenSameContextAppended_ResultIsIdempotent(ITestableContextDriver driver)
        {
            await driver.ClearAllData();
            await driver.AppendContext(TestIdentity, TestContext);
            await driver.AppendContext(TestIdentity, TestContext);
            Assert.Equal(TestContext, await driver.GetContext(TestIdentity));
        }
    }
}

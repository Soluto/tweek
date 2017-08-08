using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Engine.DataTypes;
using Engine.Drivers.Context;
using Xunit;
using FSharpUtils.Newtonsoft;

namespace ContextDriversIntegrationTests
{
    public class IntegrationTests
    {
        private static Identity TestIdentity => new Identity("@test_identity", Guid.NewGuid().ToString());

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

        protected IContextDriver Driver;

        [Fact(DisplayName = "ContextAppended_PropertyDeleted_ResultsInCorrectContext")]
        public async Task ContextAppended_PropertyDeleted_ResultsInCorrectContext()
        {
            var testIdentity = TestIdentity;
            await Driver.AppendContext(testIdentity, TestContext);
            Assert.Equal(TestContext, await Driver.GetContext(testIdentity));
            await Driver.RemoveFromContext(testIdentity, PROPERTY_TO_REMOVE);
            Assert.Equal(TestContextAfterRemoval, await Driver.GetContext(testIdentity));
        }

        [Fact(DisplayName = "ContextAppended_ThenAnotherAppended_ResultIsMerged")]
        public async Task ContextAppended_ThenAnotherAppended_ResultIsMerged()
        {
            var testIdentity = TestIdentity;
            await Driver.AppendContext(testIdentity, TestContext);
            await Driver.AppendContext(testIdentity, AnotherTestContext);
            Assert.Equal(TestContextMergedWithAnotherTestContext, await Driver.GetContext(testIdentity));
        }

        [Fact(DisplayName = "ContextAppended_ThenSameContextAppended_ResultIsIdempotent")]
        public async Task ContextAppended_ThenSameContextAppended_ResultIsIdempotent()
        {
            var testIdentity = TestIdentity;
            await Driver.AppendContext(testIdentity, TestContext);
            await Driver.AppendContext(testIdentity, TestContext);
            Assert.Equal(TestContext, await Driver.GetContext(testIdentity));
        }
    }
}

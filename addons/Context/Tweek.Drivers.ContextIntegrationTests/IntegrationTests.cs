using FSharpUtils.Newtonsoft;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using Xunit;

namespace Tweek.Drivers.ContextIntegrationTests
{
    public abstract class IntegrationTests
    {
        private static Identity TestIdentity => new Identity("@test_identity", Guid.NewGuid().ToString());

        private static readonly Dictionary<string, JsonValue> TestContext = new Dictionary<string, JsonValue>
        {
            {"Fruit", JsonValue.NewString("apple")},
            {"Color", JsonValue.NewString("red")},
            {"Taste", JsonValue.NewString("sour")},
            {"Weight", JsonValue.NewNumber((decimal) 3.141)},
        };
        private static readonly Dictionary<string, JsonValue> AnotherTestContext = new Dictionary<string, JsonValue>
        {
            {"Fruit", JsonValue.NewString("apple")},
            {"Color", JsonValue.NewString("yellow")},
            {"Price", JsonValue.NewNumber((decimal) 2.7)},
        };

        private const string PROPERTY_TO_REMOVE = "Weight";
        private const string CREATION_DATE = "@CreationDate";

        private static readonly Dictionary<string, JsonValue> TestContextAfterRemoval = TestContext
            .Where(pair => pair.Key != PROPERTY_TO_REMOVE)
            .ToDictionary(pair => pair.Key, pair => pair.Value);

        private static readonly Dictionary<string, JsonValue> TestContextMergedWithAnotherTestContext = TestContext
            .ToDictionary(pair => pair.Key, pair => pair.Value)
            .Where(pair => !AnotherTestContext.ContainsKey(pair.Key))
            .Concat(AnotherTestContext)
            .ToDictionary(pair => pair.Key, pair => pair.Value);

        protected abstract IContextDriver Driver {  get; set; }

        [Fact(DisplayName = "ContextAppended_PropertyDeleted_ResultsInCorrectContext")]
        public async Task ContextAppended_PropertyDeleted_ResultsInCorrectContext()
        {
            var testIdentity = TestIdentity;
            await Driver.AppendContext(testIdentity, TestContext);
            var result = await Driver.GetContext(testIdentity);
            Assert.Contains(CREATION_DATE, result.Keys);
            result.Remove(CREATION_DATE);
            Assert.Equal(TestContext, result);
            await Driver.RemoveFromContext(testIdentity, PROPERTY_TO_REMOVE);
            result = await Driver.GetContext(testIdentity);
            Assert.Contains(CREATION_DATE, result.Keys);
            result.Remove(CREATION_DATE);
            Assert.Equal(TestContextAfterRemoval, result);
        }

        [Fact(DisplayName = "ContextAppended_ThenAnotherAppended_ResultIsMerged")]
        public async Task ContextAppended_ThenAnotherAppended_ResultIsMerged()
        {
            var testIdentity = TestIdentity;
            await Driver.AppendContext(testIdentity, TestContext);
            await Driver.AppendContext(testIdentity, AnotherTestContext);
            var result = await Driver.GetContext(testIdentity);
            Assert.Contains(CREATION_DATE, result.Keys);
            result.Remove(CREATION_DATE);
            Assert.Equal(TestContextMergedWithAnotherTestContext, result);
        }

        [Fact(DisplayName = "ContextAppended_ThenSameContextAppended_ResultIsIdempotent")]
        public async Task ContextAppended_ThenSameContextAppended_ResultIsIdempotent()
        {
            var testIdentity = TestIdentity;
            await Driver.AppendContext(testIdentity, TestContext);
            await Driver.AppendContext(testIdentity, TestContext);
            var result = await Driver.GetContext(testIdentity);
            Assert.Contains(CREATION_DATE, result.Keys);
            result.Remove(CREATION_DATE);
            Assert.Equal(TestContext, result);
        }

        [Fact]
        public async Task ContexctCreated_ThenContextAppended_CreationDateDoesntChange()
        {
            var testIdentity = TestIdentity;
            await Driver.AppendContext(testIdentity, TestContext);
            var result = await Driver.GetContext(testIdentity);
            Assert.Contains(CREATION_DATE, result.Keys);
            var creationDate = result[CREATION_DATE];
            
            await Driver.AppendContext(testIdentity, AnotherTestContext);
            result = await Driver.GetContext(testIdentity);
            Assert.Contains(CREATION_DATE, result.Keys);
            Assert.Equal(creationDate, result[CREATION_DATE]);
        }
    }
}

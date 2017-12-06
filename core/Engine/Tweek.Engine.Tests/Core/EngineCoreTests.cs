using FSharpUtils.Newtonsoft;
using LanguageExt;
using System;
using System.Linq;
using Tweek.Engine.Core;
using Tweek.Engine.Core.Context;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Tests.Helpers;
using Xunit;
using IdentityHashSet = System.Collections.Generic.HashSet<Tweek.Engine.DataTypes.Identity>;

namespace Tweek.Engine.Tests.Core
{
    public class EngineCoreTests
    {
        public static GetLoadedContextByIdentityType CreateContext(Identity identity, params Tuple<string, JsonValue>[] tuples)
        {
            var data = tuples.ToDictionary(x => x.Item1, x => x.Item2);
            return fnIdentityType => key => fnIdentityType.Equals(identity.Type) && data.ContainsKey(key) ? data[key] : Option<JsonValue>.None;
        }

        [Fact]
        public void PathWithSimpleRule()
        {
            var identity = new Identity("device", "1");
            var identities = new IdentityHashSet {identity};
            var context = CreateContext(identity);
            var rulesRepo = RulesRepositoryHelpers.With("path/to/key", FakeRule.Create(ctx => new ConfigurationValue(JsonValue.NewString("SomeValue"))));
                
            var value = EngineCore.GetRulesEvaluator(identities, context, rulesRepo)("path/to/key").Map(x => x.Value);
            Assert.Equal(JsonValue.NewString("SomeValue"), value);
        }

        [Fact]
        public void PathWithNoMatchingRule()
        {
            var identity = new Identity("device", "1");
            var context = CreateContext(identity);
            var rulesRepo = RulesRepositoryHelpers.With("path/to/key", FakeRule.Create(ctx => new ConfigurationValue(JsonValue.NewString("SomeValue"))));

            var missingValue = EngineCore.GetRulesEvaluator(new IdentityHashSet {identity}, context,rulesRepo)("path/to/key2");

            Assert.True(missingValue.IsNone);
        }

        [Fact]
        public void FixedValueInContext()
        {
            var identity = new Identity("device", "1");
            var context = CreateContext(identity, new Tuple<string, JsonValue>("@fixed:path/to/key", JsonValue.NewString("SomeValue")));
            var rulesRepo = RulesRepositoryHelpers.Empty();

            var value = EngineCore.GetRulesEvaluator(new IdentityHashSet { identity }, context, rulesRepo)("path/to/key").Map(x => x.Value);

            Assert.Equal(JsonValue.NewString("SomeValue"), value);
        }

        [Fact]
        public void ExternalPathRefernceInContext()
        {
            var identity = new Identity("device", "1");
            var context = CreateContext(identity);
            var rulesRepo = RulesRepositoryHelpers.With("path/to/key2", FakeRule.Create(ctx => new ConfigurationValue(JsonValue.NewString("SomeValue"))))
                                                  .With("path/to/key", FakeRule.Create(ctx => ctx("@@key:path/to/key2").Map(x=>new ConfigurationValue(x))));

            var value = EngineCore.GetRulesEvaluator(new IdentityHashSet { identity }, context, rulesRepo)("path/to/key").Map(x => x.Value);

            Assert.Equal(JsonValue.NewString("SomeValue"), value);
        }

        [Fact]
        public void RulesThatCheckContextValue()
        {
            var identity = new Identity("device", "1");
            var context = CreateContext(identity, new Tuple<string, JsonValue>("PartnerBrand", JsonValue.NewString("ABC")));

            var rulesRepo = RulesRepositoryHelpers
                .With("path/to/key", FakeRule.Create(ctx => ctx("device.PartnerBrand") == JsonValue.NewString("ABC") ? new ConfigurationValue(JsonValue.NewString("SomeValue")) : Option<ConfigurationValue>.None));

            var value = EngineCore.GetRulesEvaluator(new IdentityHashSet { identity }, context, rulesRepo)("path/to/key").Map(x => x.Value);
            Assert.Equal(JsonValue.NewString("SomeValue"), value);

            rulesRepo = rulesRepo
                .With("path/to/other/key", FakeRule.Create(ctx => ctx("device.OtherProp") == JsonValue.NewString("DEF") ? new ConfigurationValue(JsonValue.NewString("SomeValue")) : Option<ConfigurationValue>.None));

            value = EngineCore.GetRulesEvaluator(new IdentityHashSet { identity }, context, rulesRepo)("path/to/other/key").Map(x => x.Value);
            Assert.True(value.IsNone);

            rulesRepo = rulesRepo
                .With("path/to/other/key", FakeRule.Create(ctx => ctx("device.PartnerBrand") == JsonValue.NewString("ABC") ? new ConfigurationValue(JsonValue.NewString("SomeValue")) : Option<ConfigurationValue>.None));

            value = EngineCore.GetRulesEvaluator(new IdentityHashSet { identity }, context, rulesRepo)("path/to/other/key").Map(x => x.Value);

            Assert.Equal(JsonValue.NewString("SomeValue"), value);
        }
    }
}

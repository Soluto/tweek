using System;
using System.Collections.Generic;
using System.Linq;
using Engine.Core.Context;
using Engine.DataTypes;
using LanguageExt;
using Xunit;

namespace Engine.Core.Tests
{
    public class EngineCoreTests
    {

        public static GetLoadedContextByIdentityType CreateContext(Identity identity, params Tuple<string, string>[] tuples)
        {
            var data = tuples.ToDictionary(x => x.Item1, x => x.Item2);
            return fnIdentityType => key => fnIdentityType.Equals(identity.Type) && data.ContainsKey(key) ? data[key] : Option<string>.None;
        }

        [Fact]
        public void PathWithSimpleRule()
        {
            var identity = new Identity("device", "1");
            var identities = new HashSet<Identity> {identity};
            var context = CreateContext(identity);
            var rulesRepo = RulesRepositoryHelpers.With("path/to/key", FakeRule.Create(ctx => new ConfigurationValue("SomeValue")));
                
            var value = EngineCore.GetRulesEvaluator(identities, context, rulesRepo)("path/to/key").Map(x => x.Value);
            Assert.Equal("SomeValue", value);
        }

        [Fact]
        public void PathWithNoMatchingRule()
        {
            var identity = new Identity("device", "1");
            var context = CreateContext(identity);
            var rulesRepo = RulesRepositoryHelpers.With("path/to/key", FakeRule.Create(ctx => new ConfigurationValue("SomeValue")));

            var missingValue = EngineCore.GetRulesEvaluator(new HashSet<Identity> {identity}, context,rulesRepo)("path/to/key2");

            Assert.True(missingValue.IsNone);
        }

        [Fact]
        public void FixedValueInContext()
        {
            var identity = new Identity("device", "1");
            var context = CreateContext(identity, new Tuple<string, string>("@fixed:path/to/key", "SomeValue"));
            var rulesRepo = RulesRepositoryHelpers.Empty();

            var value = EngineCore.GetRulesEvaluator(new HashSet<Identity> { identity }, context, rulesRepo)("path/to/key").Map(x => x.Value);

            Assert.Equal("SomeValue", value);
        }

        [Fact]
        public void ExternalPathRefernceInContext()
        {
            var identity = new Identity("device", "1");
            var context = CreateContext(identity);
            var rulesRepo = RulesRepositoryHelpers.With("path/to/key2", FakeRule.Create(ctx => new ConfigurationValue("SomeValue")))
                                                  .With("path/to/key", FakeRule.Create(ctx => ctx("@@key:path/to/key2").Map(x=>new ConfigurationValue(x))));

            var value = EngineCore.GetRulesEvaluator(new HashSet<Identity> { identity }, context, rulesRepo)("path/to/key").Map(x => x.Value);

            Assert.Equal("SomeValue", value);
        }

        [Fact]
        public void RulesThatCheckContextValue()
        {
            var identity = new Identity("device", "1");
            var context = CreateContext(identity, new Tuple<string, string>("PartnerBrand", "ABC"));

            var rulesRepo = RulesRepositoryHelpers
                .With("path/to/key", FakeRule.Create(ctx => ctx("device.PartnerBrand") == "ABC" ? new ConfigurationValue("SomeValue") : Option<ConfigurationValue>.None));

            var value = EngineCore.GetRulesEvaluator(new HashSet<Identity> { identity }, context, rulesRepo)("path/to/key").Map(x => x.Value);
            Assert.Equal("SomeValue", value);

            rulesRepo = rulesRepo
                .With("path/to/other/key", FakeRule.Create(ctx => ctx("device.OtherProp") == "DEF" ? new ConfigurationValue("SomeValue") : Option<ConfigurationValue>.None));

            value = EngineCore.GetRulesEvaluator(new HashSet<Identity> { identity }, context, rulesRepo)("path/to/other/key").Map(x => x.Value);
            Assert.True(value.IsNone);

            rulesRepo = rulesRepo
                .With("path/to/other/key", FakeRule.Create(ctx => ctx("device.PartnerBrand") == "ABC" ? new ConfigurationValue("SomeValue") : Option<ConfigurationValue>.None));

            value = EngineCore.GetRulesEvaluator(new HashSet<Identity> { identity }, context, rulesRepo)("path/to/other/key").Map(x => x.Value);

            Assert.Equal("SomeValue", value);
        }

        
    }
}

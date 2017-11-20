using System.Collections.Generic;
using Tweek.Engine.Drivers.Rules;
using Tweek.Engine.Rules.Validation;
using Xunit;

namespace Engine.Tests
{
    public class DependencyCheckerTests
    {
        [Theory(DisplayName = "Given acyclic dependencies, when dependency checker is invoked, it should pass")]
        [MemberData(nameof(AcyclicDependencies))]
        public void AcyclycDependenciesGiven_DependencyCheckerInvoked_ReturnsFalse(
            Dictionary<string, RuleDefinition> rules)
        {
            Assert.False(DependencyChecker.HasCircularDependencies(rules));
        }

        [Theory(DisplayName = "Given cyclic dependencies, when dependency checker is invoked, it should fail")]
        [MemberData(nameof(CyclicDependencies))]
        public void CyclycDependenciesGiven_DependencyCheckerInvoked_ReturnsTrue(
            Dictionary<string, RuleDefinition> rules)
        {
            Assert.True(DependencyChecker.HasCircularDependencies(rules));
        }

        public static IEnumerable<object[]> AcyclicDependencies()
        {
            yield return new object[]
            {
                new Dictionary<string, RuleDefinition>
                {
                    {"Key1", new RuleDefinition {Dependencies = new[] {"Key2"}}},
                    {"Key2", new RuleDefinition {Dependencies = new[] {"Key3"}}},
                    {"Key3", new RuleDefinition()},
                }
            };

            yield return new object[]
            {
                new Dictionary<string, RuleDefinition>()
            };

            yield return new object[]
            {
                new Dictionary<string, RuleDefinition>
                {
                    {"Key1", new RuleDefinition {Dependencies = new[] {"Key2", "Key3"}}},
                    {"Key2", new RuleDefinition {Dependencies = new[] {"Key3"}}},
                    {"Key3", new RuleDefinition()},
                }
            };
        }

        public static IEnumerable<object[]> CyclicDependencies()
        {
            yield return new object[]
            {
                new Dictionary<string, RuleDefinition>
                {
                    {"Key1", new RuleDefinition {Dependencies = new[] {"Key1"}}},
                }
            };

            yield return new object[]
            {
                new Dictionary<string, RuleDefinition>
                {
                    {"Key1", new RuleDefinition {Dependencies = new[] {"Key2"}}},
                    {"Key2", new RuleDefinition {Dependencies = new[] {"Key3"}}},
                    {"Key3", new RuleDefinition {Dependencies = new[] {"Key1"}}},
                }
            };
        }
    }
}

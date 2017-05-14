using System.Collections.Generic;

namespace Tweek.ApiService.SmokeTests.Validation.Models
{
    public class RulesetsProvider
    {
        private const string EMPTY_RULE = "{\"partitions\":[],\"valueType\":\"string\",\"rules\":[]}";
        public static IEnumerable<object[]> ValidInputs()
        {
            yield return new object[]
            {
                new Dictionary<string, RuleDefinition>
                {
                    {"Key1", new RuleDefinition() {Payload = EMPTY_RULE, Dependencies = new[] {"Key2"}}},
                    {"Key2", new RuleDefinition() {Payload = EMPTY_RULE, Dependencies = new[] {"Key3"}}},
                    {"Key3", new RuleDefinition() {Payload = EMPTY_RULE}},
                }
            };
        }

        public static IEnumerable<object[]> CircularDependenciesInputs()
        {
            yield return new object[]
            {
                new Dictionary<string, RuleDefinition>
                {
                    {"Key1", new RuleDefinition() {Payload = EMPTY_RULE, Dependencies = new[] {"Key2"}}},
                    {"Key2", new RuleDefinition() {Payload = EMPTY_RULE, Dependencies = new[] {"Key3"}}},
                    {"Key3", new RuleDefinition() {Payload = EMPTY_RULE, Dependencies = new[] {"Key1"}}},
                }
            };
        }
    }

}
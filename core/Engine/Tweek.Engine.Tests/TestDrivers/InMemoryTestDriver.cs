using FSharpUtils.Newtonsoft;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Tweek.Engine.DataTypes;
using Tweek.Engine.Drivers.Context;
using Tweek.Engine.Drivers.Rules;

namespace Tweek.Engine.Tests.TestDrivers
{
    internal class InMemoryRulesRepository : IRulesRepository
    {
        private Dictionary<string, RuleDefinition> _rules;

        public InMemoryRulesRepository(Dictionary<string, RuleDefinition> rules, string label = null)
        {
            _rules = rules;
            CurrentLabel = label;
        }

#pragma warning disable 0067
        public event Action<IDictionary<string, RuleDefinition>> OnRulesChange;
#pragma warning restore 0067

        public async Task<Dictionary<string, RuleDefinition>> GetAllRules() => _rules;

        public string CurrentLabel { get; }

        public DateTime LastCheckTime => DateTime.UtcNow;
    }

    internal class InMemoryContextDriver : IContextDriver
    {
        private readonly Dictionary<Identity, Dictionary<string, JsonValue>> _dictionary;

        public InMemoryContextDriver(Dictionary<Identity, Dictionary<string, JsonValue>> dictionary)
        {
            _dictionary = dictionary;
        }

        public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
        {
            var currentContext = _dictionary[identity];
            foreach (var item in context)
            {
                currentContext[item.Key] = item.Value;
            }
        }

        public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity) => _dictionary[identity];

        public async Task RemoveFromContext(Identity identity, string key)
        {
            var currentContext = _dictionary[identity];
            currentContext.Remove(key);
        }
    }

    internal class InMemoryTestDriver : ITestDriver
    {
        private Dictionary<Identity, Dictionary<string, JsonValue>> dictionary =
            new Dictionary<Identity, Dictionary<string, JsonValue>>();

        public IContextDriver Context => new InMemoryContextDriver(dictionary);

        private async Task InsertContextRows(Dictionary<Identity, Dictionary<string, JsonValue>> contexts)
        {
            foreach (var x in contexts)
            {
                dictionary.Add(x.Key, x.Value);
            }
        }

        private async Task Flush() => dictionary.Clear();

        public TestScope SetTestEnviornment(Dictionary<Identity, Dictionary<string, JsonValue>> contexts, string[] keys,
            Dictionary<string, RuleDefinition> rules)
        {
            return new TestScope(rules: new InMemoryRulesRepository(rules), context: Context,
                init: () => InsertContextRows(contexts),
                dispose: Flush);
        }
    }
}
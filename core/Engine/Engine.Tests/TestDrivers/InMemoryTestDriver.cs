using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Engine.DataTypes;
using Engine.Drivers.Context;
using Engine.Drivers.Rules;
using FSharpUtils.Newtonsoft;

namespace Engine.Tests.TestDrivers
{
    class InMemoryRulesRepository : IRulesRepository
    {
        private Dictionary<string, RuleDefinition> rules;

        public InMemoryRulesRepository(Dictionary<string, RuleDefinition> rules, string label = null)
        {
            this.rules = rules;
            CurrentLabel = label;
        }

#pragma warning disable 0067
        public event Action<IDictionary<string, RuleDefinition>> OnRulesChange;
#pragma warning restore 0067

        public async Task<Dictionary<string, RuleDefinition>> GetAllRules()
        {
            return rules;
        }

        public string CurrentLabel { get; }

        public DateTime LastCheckTime => DateTime.UtcNow;
    }

  class InMemoryContextDriver : IContextDriver
  {
    private Dictionary<Identity, Dictionary<string, JsonValue>> dictionary = new Dictionary<Identity, Dictionary<string, JsonValue>>();
    public InMemoryContextDriver(Dictionary<Identity, Dictionary<string, JsonValue>> dictionary){
        this.dictionary = dictionary;
    }
    public async Task AppendContext(Identity identity, Dictionary<string, JsonValue> context)
    {
        var currentContext = dictionary[identity];
        foreach (var item in context){
            currentContext[item.Key] = item.Value;
        }
    }

    public async Task<Dictionary<string, JsonValue>> GetContext(Identity identity)
    {
      return dictionary[identity];
    }

    public async Task RemoveFromContext(Identity identity, string key)
    {
        var currentContext = dictionary[identity];
        currentContext.Remove(key);
    }
  }

  class InMemoryTestDriver : ITestDriver
    {
        private Dictionary<Identity, Dictionary<string, JsonValue>> dictionary = new Dictionary<Identity, Dictionary<string, JsonValue>>();

        public IContextDriver Context => new InMemoryContextDriver(dictionary);

        public InMemoryTestDriver()
        {
        }

        async Task InsertContextRows(Dictionary<Identity, Dictionary<string, JsonValue>> contexts)
        {
            foreach (var x in contexts){
                dictionary.Add(x.Key, x.Value);
            }
        }
       
        async Task Flush()
        {
            dictionary.Clear();
        }

        public TestScope SetTestEnviornment(Dictionary<Identity, Dictionary<string, JsonValue>> contexts, string[] keys, Dictionary<string, RuleDefinition> rules)
        {
            return new TestScope(rules: new InMemoryRulesRepository(rules), context: Context, 
                init: () => InsertContextRows(contexts),
                dispose: Flush);
        }
    }
}
